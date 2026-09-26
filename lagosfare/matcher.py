"""Route loading and fuzzy location matching.

Everything here reads from a local JSON file, so the same functions can be
imported by a future mobile backend without pulling in a database or network
call.
"""

import difflib
import json
from pathlib import Path

from .models import Route

# The dataset ships inside the package directory's sibling data folder, so it
# is resolved relative to this file rather than the working directory. That way
# the CLI works no matter where it is run from.
DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "routes.json"

VALID_TRANSPORT = ("danfo", "brt", "keke")

# similarity floor for a typed location to be treated as the same place.
# 0.72 catches "cm" -> "CMS" and "yaba " -> "Yaba" without turning
# "Maryland" into "Marylandx" style false positives.
MATCH_CUTOFF = 0.72


def normalize(text: str) -> str:
    """Reduce a typed location to a comparable form.

    Lowercases, strips surrounding whitespace and collapses internal runs of
    spaces, so "  CMS " and "cms" both compare the same.
    """
    return " ".join(text.lower().split())


def load_routes(data_file: Path = DATA_FILE) -> list[Route]:
    """Read the route dataset and return it as Route objects.

    Entries missing a required field are skipped rather than raising, so one
    bad row in the JSON cannot take the whole CLI down.
    """
    with open(data_file, encoding="utf-8") as handle:
        payload = json.load(handle)

    routes = []
    for entry in payload.get("routes", []):
        try:
            routes.append(
                Route(
                    origin=entry["origin"].strip(),
                    destination=entry["destination"].strip(),
                    transport_type=entry["transport_type"].strip().lower(),
                    fare_naira=int(entry["fare_naira"]),
                    notes=entry.get("notes", "").strip(),
                )
            )
        except (KeyError, TypeError, ValueError):
            continue

    return routes


def known_locations(routes: list[Route]) -> list[str]:
    """Every distinct place mentioned in the dataset, alphabetically."""
    places = set()
    for route in routes:
        places.add(route.origin)
        places.add(route.destination)
    return sorted(places, key=str.lower)


def find_location(query: str, locations: list[str]) -> str | None:
    """Resolve free text to a dataset location, or None if nothing is close.

    Exact matches win outright so a real location is never shadowed by a
    similarly spelled neighbour. Otherwise the closest match above the
    similarity cutoff is returned.
    """
    target = normalize(query)
    if not target:
        return None

    lookup = {normalize(name): name for name in locations}

    if target in lookup:
        return lookup[target]

    matches = difflib.get_close_matches(target, list(lookup.keys()), n=1, cutoff=MATCH_CUTOFF)
    if not matches:
        return None

    return lookup[matches[0]]


def suggest_locations(query: str, locations: list[str], limit: int = 3) -> list[str]:
    """Closest known locations to a query, for the no-match case."""
    matches = difflib.get_close_matches(
        normalize(query), [normalize(name) for name in locations], n=limit, cutoff=0.4
    )
    by_normalized = {normalize(name): name for name in locations}
    return [by_normalized[match] for match in matches]


def find_routes(origin: str, destination: str, routes: list[Route] | None = None) -> list[Route]:
    """Return every transport option between two locations.

    Both ends are fuzzy matched, and the route may be given in either
    direction, so a user who types the trip backwards still gets an answer.
    """
    all_routes = load_routes() if routes is None else routes
    locations = known_locations(all_routes)

    matched_origin = find_location(origin, locations)
    matched_destination = find_location(destination, locations)
    if matched_origin is None or matched_destination is None:
        return []

    return _collect(all_routes, matched_origin, matched_destination)


def _collect(routes: list[Route], origin: str, destination: str) -> list[Route]:
    """Gather every route between two locations, in either direction.

    Filtering the whole list rather than indexing by location is what lets a
    pair with several options, a danfo and a BRT for instance, return all of
    them instead of just the last one seen.
    """
    wanted_origin = normalize(origin)
    wanted_destination = normalize(destination)

    matches = [
        route
        for route in routes
        if (normalize(route.origin), normalize(route.destination))
        in ((wanted_origin, wanted_destination), (wanted_destination, wanted_origin))
    ]

    return _deduplicate(matches)


def _deduplicate(routes: list[Route]) -> list[Route]:
    """Drop repeats created by matching a route in both directions."""
    seen = set()
    unique = []
    for route in routes:
        key = (
            normalize(route.origin),
            normalize(route.destination),
            route.transport_type,
            route.fare_naira,
        )
        if key in seen:
            continue
        seen.add(key)
        unique.append(route)
    return unique
