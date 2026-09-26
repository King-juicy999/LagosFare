# LagosFare

A fare and route helper for Lagos public transport. Ask for a journey between
two areas and get back every way of making it, with what the trip is likely to
cost.

It knows about danfo, BRT and keke napep, and it is forgiving about how you
spell things, so `cm`, `CMS` and ` cms ` all find the same place.

## Requirements

- Python 3.10 or newer

## Installation

```bash
git clone https://github.com/King-juicy999/LagosFare.git
cd LagosFare
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Usage

Find a route between two locations:

```bash
python -m lagosfare from "Yaba" "CMS"
```

The locations do not have to be quoted, and spelling is forgiving:

```bash
python -m lagosfare from yaba cms
python -m lagosfare from "yaba" "cm"
```

See every location the tool knows:

```bash
python -m lagosfare --list-areas
```

## Examples

```
$ python -m lagosfare from "Yaba" "CMS"

Yaba to CMS

+-----------------------------------------------------------------------------+
| TRANSPORT | EST. FARE | NOTES                                               |
|-----------+-----------+-----------------------------------------------------|
| BRT       | N350      | Board at Yaba BRT stop, alight at CMS under the     |
|           |           | bridge                                              |
| DANFO     | N300      | Yellow bus from Yaba bus stop, drop at CMS bus stop |
|           |           | near the underpass                                  |
+-----------------------------------------------------------------------------+

Fares are estimates and can vary with traffic, fuel prices and time of day.
```

```
$ python -m lagosfare from "Oshodi" "Ikeja"

Oshodi to Ikeja

+-----------------------------------------------------------------------------+
| TRANSPORT | EST. FARE | NOTES                                               |
|-----------+-----------+-----------------------------------------------------|
| BRT       | N350      | BRT from Oshodi terminal, one of the busiest        |
|           |           | stations, leave early                               |
+-----------------------------------------------------------------------------+

Fares are estimates and can vary with traffic, fuel prices and time of day.
```

When there is no direct route, it suggests somewhere close instead:

```
$ python -m lagosfare from "Yaba" "Akatyper"

No direct route from 'Yaba' to 'Akatyper'.

Did you mean for the origin: Yaba, Ajah, Marina
Did you mean for the destination: Anthony
```

## Running the tests

```bash
pytest
```

## Adding a route

Routes live in [data/routes.json](data/routes.json). Add an entry with the same
shape as the ones already there and it is picked up on the next run, no code
change needed.

```json
{
  "origin": "Yaba",
  "destination": "CMS",
  "transport_type": "brt",
  "fare_naira": 350,
  "notes": "Board at Yaba BRT stop, alight at CMS under the bridge"
}
```

`transport_type` must be `danfo`, `brt` or `keke`.

## A note on fares

Every fare here is an estimate for planning purposes. The real price depends on
traffic, fuel prices and the time of day, and drivers set the final amount at
the stop. Treat the output as guidance, not a quote.

## Built by Willy
