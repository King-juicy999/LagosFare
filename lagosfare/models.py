"""Data structures used across LagosFare."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Route:
    """A single vehicle option between two Lagos locations.

    A corridor can carry more than one option, a danfo and a BRT for
    instance, so the transport type is what classifies and colours an
    option while the name is what a passenger would recognise it by.

    Fares are estimates, not quotes. Drivers set the real price at the
    stop based on traffic, fuel and time of day.
    """

    origin: str
    destination: str
    transport_type: str
    fare_naira: int
    name: str = ""
    notes: str = ""

    @property
    def fare_display(self) -> str:
        """Fare formatted the way naira amounts are read out in Nigeria."""
        return f"N{self.fare_naira:,}"

    @property
    def label(self) -> str:
        """The vehicle name, falling back to the transport type."""
        return self.name or self.transport_type.upper()
