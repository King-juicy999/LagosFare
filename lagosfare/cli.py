"""Command line interface for LagosFare.

Run it with:

    python -m lagosfare.cli from "Yaba" to "CMS"
    python -m lagosfare.cli --list-areas
"""

import argparse
import sys

from .matcher import find_routes, known_locations, load_routes, suggest_locations

try:
    from rich.console import Console
    from rich.table import Table

    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="lagosfare",
        description="Fare and route helper for Lagos public transport.",
    )
    # Not required, because "lagosfare --list-areas" is valid on its own.
    subparsers = parser.add_subparsers(dest="command")

    # The word "to" is not accepted between the two locations because argparse
    # would read it as an option prefix rather than a connector, so the syntax
    # is "lagosfare from <origin> <destination>".
    from_command = subparsers.add_parser("from", help="Find routes between two locations.")
    from_command.add_argument("origin", help="Where you are starting from.")
    from_command.add_argument("destination", help="Where you want to get to.")

    # This is a flag rather than a subcommand, so it sits on the main parser
    # and works without typing a command in front of it.
    parser.add_argument(
        "--list-areas",
        action="store_true",
        help="Show every location in the dataset.",
    )

    return parser


def _render_table(rows: list[tuple[str, str, str]], header: tuple[str, str, str]) -> None:
    """Print a three column table, using rich when it is installed."""
    if RICH_AVAILABLE:
        table = Table(show_header=True, header_style="bold cyan")
        for column in header:
            table.add_column(column)
        for row in rows:
            table.add_row(*row)
        Console().print(table)
        return

    widths = [
        max(len(header[index]), *(len(row[index]) for row in rows))
        for index in range(len(header))
    ]

    def line(cells: tuple[str, str, str]) -> str:
        return "  ".join(cell.ljust(widths[index]) for index, cell in enumerate(cells)).rstrip()

    separator = "  ".join("-" * width for width in widths)
    print(line(header))
    print(separator)
    for row in rows:
        print(line(row))


def show_routes(origin: str, destination: str) -> int:
    """Look up a journey and print every option found."""
    routes = load_routes()
    matches = find_routes(origin, destination, routes)

    if not matches:
        locations = known_locations(routes)
        print(f"No direct route from '{origin}' to '{destination}'.")
        print()

        for label, query in (("origin", origin), ("destination", destination)):
            nearby = suggest_locations(query, locations)
            if nearby:
                print(f"Did you mean for the {label}: {', '.join(nearby)}")
        return 1

    title = f"{matches[0].origin} to {matches[0].destination}"
    if RICH_AVAILABLE:
        Console().print(f"\n[bold]{title}[/bold]\n")
    else:
        print(f"\n{title}\n")

    rows = [
        (route.label, route.fare_display, route.notes or "-")
        for route in matches
    ]
    _render_table(rows, ("VEHICLE", "EST. FARE", "NOTES"))
    print(
        "\nFares are estimates, not set prices. Agree the amount with the "
        "driver before boarding."
    )
    return 0


def list_areas() -> int:
    """Print every location the dataset knows about."""
    locations = known_locations(load_routes())

    if RICH_AVAILABLE:
        Console().print(f"\n[bold]{len(locations)} known locations[/bold]\n")
    else:
        print(f"\n{len(locations)} known locations\n")

    for name in locations:
        print(f"  {name}")
    print()
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.list_areas:
        return list_areas()

    # No command and no flag, so show how to use it rather than raising.
    if not args.command:
        parser.print_help()
        return 0

    return show_routes(args.origin, args.destination)


if __name__ == "__main__":
    sys.exit(main())
