# LagosFare

A fare and route helper for Lagos public transport. Ask for a journey between
two areas and get back every way of making it, with what the trip is likely to
cost.

It exists in two forms. There is a Python command line tool for quick lookups,
and an Expo app for planning a trip on your phone. Both read the same
hand-written dataset, so a fare you check in the terminal is the fare the app
shows you.

It knows about danfo, BRT and keke napep, and it is forgiving about how you
spell things, so `cm`, `CMS` and ` cms ` all find the same place.

## The data

Everything lives in [data/routes.json](data/routes.json). Both the CLI and the
app read that one file, and there is no database, no server and no network
call at runtime.

**Every route and fare in this file is hand-written.** Nothing is scraped from
any website, transit API or third-party source. That is a deliberate choice,
not a limitation to work around later: the data has to be defensible on its
own terms, and the app is intended to ship to the Play Store, where copying
someone else's fare tables would be a policy problem.

The dataset currently covers:

| | |
| --- | --- |
| Areas | 22 |
| Corridors | 34 |
| Vehicle options | 36 |

## The command line tool

### Requirements

- Python 3.10 or newer

### Installation

```bash
git clone https://github.com/King-juicy999/LagosFare.git
cd LagosFare
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Usage

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

The `to` between the two locations is not part of the syntax. `argparse` reads
it as the start of an option rather than a connector, so the command is
`lagosfare from <origin> <destination>` and nothing else.

### Examples

```
$ python -m lagosfare from "Yaba" "CMS"

Yaba to CMS

+-----------------------------------------------------------------------------+
| VEHICLE | EST. FARE | NOTES                                                 |
|---------+-----------+-------------------------------------------------------|
| BRT     | N350      | Board at Yaba BRT stop, alight at CMS under the       |
|         |           | bridge                                                |
| Danfo   | N300      | Yellow bus from Yaba bus stop, drop at CMS bus stop   |
|         |           | near the underpass                                    |
+-----------------------------------------------------------------------------+

Fares are estimates, not set prices. Agree the amount with the driver before boarding.
```

```
$ python -m lagosfare from "Oshodi" "Ikeja"

Oshodi to Ikeja

+-----------------------------------------------------------------------------+
| VEHICLE | EST. FARE | NOTES                                                 |
|---------+-----------+-------------------------------------------------------|
| BRT     | N350      | BRT from Oshodi terminal, one of the busiest          |
|         |           | stations, leave early                                 |
+-----------------------------------------------------------------------------+

Fares are estimates, not set prices. Agree the amount with the driver before boarding.
```

When there is no direct route, it suggests somewhere close instead:

```
$ python -m lagosfare from "Yaba" "Akatyper"

No direct route from 'Yaba' to 'Akatyper'.

Did you mean for the origin: Yaba, Ajah, Marina
Did you mean for the destination: Anthony
```

### The output table

The first column is the **vehicle**, not the transport type. A corridor carries
whatever the passengers actually call the service on that road, a korope on
the Lekki Expressway, a danfo everywhere else. The transport type is what
classifies and colours the option underneath, and is what the `transport_type`
field records in the data.

The CLI prints rows in the order they appear in the data. The app sorts its
own results cheapest first.

### Adding a route

Add an entry to [data/routes.json](data/routes.json) with the same shape as the
ones already there and both the CLI and the app pick it up on the next run. No
code change needed on either side.

A corridor holds a list of options, because one road can carry more than one
kind of vehicle:

```json
{
  "origin": "Yaba",
  "destination": "CMS",
  "options": [
    {
      "name": "BRT",
      "transport_type": "brt",
      "fare_naira": 350,
      "notes": "Board at Yaba BRT stop, alight at CMS under the bridge"
    }
  ]
}
```

| Field | |
| --- | --- |
| `origin` | Where the vehicle leaves from. |
| `destination` | Where it arrives. |
| `options` | The vehicles available on this corridor. |
| `options[].name` | What a passenger would call it. Shown in the table and on the card. |
| `options[].transport_type` | `danfo`, `brt` or `keke`. Drives the colour. |
| `options[].fare_naira` | The estimate, as a whole number. |
| `options[].notes` | One practical sentence about boarding or the trip. |

Areas live in the same file under `areas`, each with a name and a coordinate.
The app uses those coordinates to place pins on the map and to work out which
area you are nearest when you let it read your location.

### Running the tests

```bash
pytest
```

## The app

An Expo app in [app/](app/), written in TypeScript. It reads the same
`data/routes.json` as the CLI, bundled at build time, so it works with no
network connection once installed.

### Requirements

- Node.js 20 or newer
- The Expo Go app on your phone, or an Android emulator or iOS simulator

### Installation

```bash
cd app
npm install
```

### Running it

```bash
npm start          # dev server, scan the QR code with Expo Go
npm run ios        # open in the iOS simulator
npm run android    # open on an Android emulator or device
npm run web        # browser
npm run typecheck  # tsc --noEmit
```

`npm install` has an `allowScripts` entry in [app/package.json](app/package.json)
for `@react-native-async-storage/async-storage`, which needs its install script
to run to build the native module. npm 11 blocks lifecycle scripts by default
and will refuse without it.

### What it does

**First launch.** A welcome screen explains what the app is for in one line
and names the three vehicle types. Pressing **Get started**, or **Skip**, sets
a flag in AsyncStorage and drops you into the app. The flag is what stops the
screen coming back on every launch, and clearing the app's storage brings it
back.

**Plan a trip.** Two fields, from and to, each with fuzzy suggestions as you
type. There is a locate button on the origin field that fills it in from your
current position, matching you to the nearest area centre within 12 km. Results
come back as cards, cheapest first, and each card can either open the journey
in Google Maps or hand it to the map tab.

The app also finds two-leg journeys that the CLI does not, so a trip with no
direct corridor, Gbagada to Ikeja for instance, comes back as options via a
connecting corridor rather than nothing at all.

**Map.** Every area in the dataset as a pin, with your own position when
permission is granted. Sending a result over from the plan tab frames the map
on those two areas and colours the origin pin green and the destination pin
red. The pins mark area centres, not exact bus stops.

### How it is laid out

```
app/src/
  app/                 routes
    _layout.tsx        root stack, fonts, splash, map focus context
    index.tsx          first launch gate, redirects to welcome or plan
    welcome.tsx        the welcome screen
    (tabs)/            plan and map
  components/          place input, trip option card
  constants/           colours, vehicle styling, map pin colours
  lib/                 data loading, matching, geo, location, first run
```

### Known gaps

- **The Map tab does not work on web.** `react-native-maps` has no web
  implementation, and because Expo Router bundles every route, the whole web
  build fails before anything renders. Test on a real device or a simulator.
- **Corridors that run in both directions return both halves.** Searching
  `Lekki` to `Ajah` also returns the `Ajah` to `Lekki` entry, because the
  matcher treats a corridor as undirected so that a backwards search still
  finds an answer. The two directions are genuinely separate entries in the
  data, so a corridor listed twice shows up twice.

## A note on fares

Every fare here is an estimate for planning purposes. The real price depends on
traffic, fuel prices and the time of day, and drivers set the final amount at
the stop. Treat the output as guidance, not a quote, and agree the amount
before you board.

## Version 1 scope

What Version 1 is: the CLI, the app, the shared hand-written dataset, the
welcome screen, trip planning and the map.

What it deliberately leaves out: live vehicle position tracking, fare
adjustment over time, and anything that would need a live data feed. These are
not stubbed out or hidden behind a disabled flag. They are simply not built,
because a hand-written dataset cannot honestly support them.

## Built by William
