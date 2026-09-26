"""Tests for the fuzzy route matching."""

import pytest

from lagosfare.matcher import (
    find_location,
    find_routes,
    known_locations,
    load_routes,
    normalize,
    suggest_locations,
)


@pytest.fixture
def routes():
    return load_routes()


def test_dataset_loads(routes):
    assert len(routes) >= 25


def test_every_route_has_valid_transport_type(routes):
    assert all(route.transport_type in ("danfo", "brt", "keke") for route in routes)


def test_every_route_has_a_fare(routes):
    assert all(route.fare_naira > 0 for route in routes)


def test_normalize_collapses_case_and_whitespace():
    assert normalize("  CMS  ") == "cms"
    assert normalize("Yaba") == "yaba"


def test_find_location_exact(routes):
    assert find_location("Yaba", known_locations(routes)) == "Yaba"


def test_find_location_is_case_insensitive(routes):
    assert find_location("yaba", known_locations(routes)) == "Yaba"


def test_find_location_tolerates_extra_whitespace(routes):
    assert find_location("  CMS  ", known_locations(routes)) == "CMS"


def test_find_location_handles_abbreviations(routes):
    assert find_location("cm", known_locations(routes)) == "CMS"


def test_find_location_returns_none_for_nonsense(routes):
    assert find_location("zzzz nowhere", known_locations(routes)) is None


def test_find_routes_exact_match(routes):
    matches = find_routes("Yaba", "CMS", routes)
    assert matches
    assert all(route.origin == "Yaba" and route.destination == "CMS" for route in matches)


def test_find_routes_returns_every_transport_option(routes):
    matches = find_routes("Yaba", "CMS", routes)
    types = {route.transport_type for route in matches}
    assert "brt" in types
    assert "danfo" in types


def test_find_routes_is_case_insensitive(routes):
    assert find_routes("yaba", "cms", routes)


def test_find_routes_works_in_reverse(routes):
    forward = find_routes("Yaba", "CMS", routes)
    backward = find_routes("CMS", "Yaba", routes)
    assert len(forward) == len(backward)
    assert backward


def test_find_routes_with_fuzzy_input(routes):
    assert find_routes("yaba", "cm ", routes)


def test_find_routes_no_match_returns_empty(routes):
    assert find_routes("Yaba", "Akatyper", routes) == []


def test_suggestions_are_returned_for_a_bad_input(routes):
    suggestions = suggest_locations("Yabba", known_locations(routes))
    assert "Yaba" in suggestions


def test_known_locations_are_sorted_and_unique(routes):
    locations = known_locations(routes)
    assert locations == sorted(locations, key=str.lower)
    assert len(locations) == len(set(locations))
