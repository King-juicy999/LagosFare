"""Data structures used across LagosFare."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Route:
    """A single journey option between two Lagos locations.

    Fares are estimates, not quotes. Drivers set the real price at the
    stop based on traffic, fuel and time of day.
    """

    origin: str
    destination: str
    transport_type: str
    fare_naira: int
    notes: str = ""

    @property
    def fare_display(self) -> str:
        """Fare formatted the way naira amounts are read out in Nigeria."""
        return f"N{self.fare_naira:,}"
