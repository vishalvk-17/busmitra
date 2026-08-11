import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./OperatorDashboard.css";

// =====================================================
// TABS
// =====================================================

const tabs = [
  ["dashboard", "Dashboard"],
  ["buses", "Bus Management"],
  ["drivers", "Driver Management"],
  ["routes", "Routes"],
  ["trips", "Trips"],
  ["fleet", "Live Fleet"],
  ["reports", "Reports"],
];

// =====================================================
// EMPTY FORMS
// =====================================================

const emptyBus = {
  busNumber: "",
  registrationNumber: "",
  totalSeats: "",
  busType: "ordinary",
};

const emptyDriver = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

const emptyRoute = {
  routeName: "",
  routeNumber: "",
  origin: "",
  destination: "",
  distanceKm: "",
  estimatedDurationMinutes: "",
  fare: "",
};

const emptyTrip = {
  bus: "",
  driver: "",
  route: "",
  tripDate: "",
  scheduledStartTime: "",
};


// =====================================================
// OPERATOR DASHBOARD
// =====================================================

function OperatorDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState("dashboard");

  const [data, setData] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [busForm, setBusForm] =
    useState(emptyBus);

  const [driverForm, setDriverForm] =
    useState(emptyDriver);

  const [routeForm, setRouteForm] =
    useState(emptyRoute);

  const [tripForm, setTripForm] =
    useState(emptyTrip);


  // ===================================================
  // LOAD SECTION
  // ===================================================

  const load = useCallback(
    async (tab = activeTab) => {
      setLoading(true);
      setError("");

      try {
        const endpoint =
          tab === "dashboard"
            ? "/operators/dashboard"
            : `/operators/${tab}`;

        const response =
          await api.get(endpoint);

        setData((current) => ({
          ...current,
          [tab]: response.data,
        }));


        // -----------------------------------------------
        // Trip dropdown data
        // -----------------------------------------------

        if (tab === "trips") {
          const [
            busesResponse,
            driversResponse,
            routesResponse,
          ] = await Promise.all([
            api.get("/operators/buses"),
            api.get("/operators/drivers"),
            api.get("/operators/routes"),
          ]);

          setData((current) => ({
            ...current,

            buses:
              busesResponse.data,

            drivers:
              driversResponse.data,

            routes:
              routesResponse.data,
          }));
        }
      } catch (requestError) {
        console.error(
          "Operator Dashboard Error:",
          requestError
        );

        const status =
          requestError.response?.status;

        if (
          status === 401 ||
          status === 403
        ) {
          navigate("/operator/login");
          return;
        }

        setError(
          requestError.response?.data
            ?.message ||
            "Unable to load this section."
        );
      } finally {
        setLoading(false);
      }
    },
    [activeTab, navigate]
  );


  // ===================================================
  // INITIAL LOAD / TAB CHANGE
  // ===================================================

  useEffect(() => {
    load(activeTab);
  }, [activeTab, load]);


  // ===================================================
  // TAB CHANGE
  // ===================================================

  const chooseTab = (tab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };


  // ===================================================
  // FORM SUBMIT
  // ===================================================

  const submit = async (
    event,
    endpoint,
    body,
    reset,
    refresh
  ) => {
    event.preventDefault();

    setError("");

    try {
      await api.post(
        endpoint,
        body
      );

      reset();

      await load(refresh);
    } catch (requestError) {
      console.error(
        "Submit Error:",
        requestError
      );

      setError(
        requestError.response?.data
          ?.message ||
          "Could not save your changes."
      );
    }
  };


  // ===================================================
  // START / END TRIP
  // ===================================================

  const startOrEndTrip = async (
    trip,
    action
  ) => {
    try {
      setError("");

      await api.put(
        `/trips/${trip._id}/${action}`
      );

      await load("trips");
    } catch (requestError) {
      console.error(
        "Trip Action Error:",
        requestError
      );

      setError(
        requestError.response?.data
          ?.message ||
          "Trip action failed."
      );
    }
  };


  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    localStorage.removeItem(
      "busMitraToken"
    );

    localStorage.removeItem(
      "busMitraUser"
    );

    navigate("/operator/login");
  };


  // ===================================================
  // DASHBOARD DATA
  // ===================================================

  const dashboard =
    data.dashboard?.stats || {};


  // ===================================================
  // CURRENT TAB TITLE
  // ===================================================

  const currentTab =
    tabs.find(
      ([key]) => key === activeTab
    )?.[1] || "Dashboard";


  return (
    <main className="operator-dashboard">

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileSidebarOpen && (
        <div
          className="operator-overlay"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`operator-sidebar ${
          mobileSidebarOpen
            ? "mobile-open"
            : ""
        }`}
      >

        <div className="operator-sidebar-top">

          {/* Brand */}

          <div className="operator-brand">

            <div className="operator-logo">
              B
            </div>

            <div>
              <strong>
                Bus Mitra
              </strong>

              <span>
                Operator Panel
              </span>
            </div>

          </div>


          {/* Navigation */}

          <nav className="operator-nav">

            <span className="nav-heading">
              OPERATIONS
            </span>

            {tabs.map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={
                    activeTab === key
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    chooseTab(key)
                  }
                >

                  <span className="nav-icon">
                    {getTabIcon(key)}
                  </span>

                  <span>
                    {label}
                  </span>

                </button>
              )
            )}

          </nav>

        </div>


        {/* Sidebar Bottom */}

        <div className="operator-sidebar-bottom">

          <button
            type="button"
            className="operator-settings-btn"
            onClick={() =>
              navigate(
                "/operator/settings"
              )
            }
          >
            ⚙
            <span>
              Settings
            </span>
          </button>


          <button
            type="button"
            className="operator-logout"
            onClick={logout}
          >
            ↪
            <span>
              Log out
            </span>
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="operator-content">

        {/* Header */}

        <header className="operator-header">

          <div className="operator-header-left">

            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() =>
                setMobileSidebarOpen(
                  true
                )
              }
            >
              ☰
            </button>

            <div>

              <p>
                Operations centre
              </p>

              <h1>
                {currentTab}
              </h1>

            </div>

          </div>


          <button
            type="button"
            className="refresh-btn"
            onClick={() =>
              load()
            }
            disabled={loading}
          >
            ↻
            <span>
              Refresh
            </span>
          </button>

        </header>


        {/* Error */}

        {error && (
          <div
            className="operator-error"
            role="alert"
          >
            <span>
              ⚠
            </span>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}


        {/* Loading */}

        {loading ? (
          <LoadingState />
        ) : (
          <>

            {/* =========================================
                DASHBOARD
            ========================================= */}

            {activeTab ===
              "dashboard" && (
              <DashboardSection
                dashboard={
                  dashboard
                }
                runningTrips={
                  data.dashboard
                    ?.runningTrips
                }
              />
            )}


            {/* =========================================
                BUSES
            ========================================= */}

            {activeTab ===
              "buses" && (
              <BusSection
                busForm={busForm}
                setBusForm={
                  setBusForm
                }
                submit={submit}
                buses={
                  data.buses?.buses
                }
              />
            )}


            {/* =========================================
                DRIVERS
            ========================================= */}

            {activeTab ===
              "drivers" && (
              <DriverSection
                driverForm={
                  driverForm
                }
                setDriverForm={
                  setDriverForm
                }
                submit={submit}
                drivers={
                  data.drivers?.drivers
                }
              />
            )}


            {/* =========================================
                ROUTES
            ========================================= */}

            {activeTab ===
              "routes" && (
              <RouteSection
                routeForm={
                  routeForm
                }
                setRouteForm={
                  setRouteForm
                }
                submit={submit}
                routes={
                  data.routes?.routes
                }
              />
            )}


            {/* =========================================
                TRIPS
            ========================================= */}

            {activeTab ===
              "trips" && (
              <TripSection
                tripForm={
                  tripForm
                }
                setTripForm={
                  setTripForm
                }
                submit={submit}
                buses={
                  data.buses?.buses
                }
                drivers={
                  data.drivers?.drivers
                }
                routes={
                  data.routes?.routes
                }
                trips={
                  data.trips?.trips
                }
                startOrEndTrip={
                  startOrEndTrip
                }
              />
            )}


            {/* =========================================
                LIVE FLEET
            ========================================= */}

            {activeTab ===
              "fleet" && (
              <FleetSection
                fleet={
                  data.fleet?.fleet
                }
              />
            )}


            {/* =========================================
                REPORTS
            ========================================= */}

            {activeTab ===
              "reports" && (
              <ReportsSection
                report={
                  data.reports?.report
                }
              />
            )}

          </>
        )}

      </section>

    </main>
  );
}


// =====================================================
// TAB ICON
// =====================================================

function getTabIcon(
  tab
) {
  const icons = {
    dashboard: "▦",
    buses: "🚌",
    drivers: "♙",
    routes: "⌁",
    trips: "◷",
    fleet: "◉",
    reports: "▥",
  };

  return icons[tab] || "•";
}


// =====================================================
// LOADING STATE
// =====================================================

function LoadingState() {
  return (
    <div className="operator-loading">

      <div className="loading-spinner"></div>

      <p>
        Loading operations data...
      </p>

    </div>
  );
}


// =====================================================
// DASHBOARD SECTION
// =====================================================

function DashboardSection({
  dashboard,
  runningTrips = [],
}) {
  const stats = [
    [
      "Total buses",
      dashboard?.buses,
      "🚌",
    ],
    [
      "Active buses",
      dashboard?.activeBuses,
      "●",
    ],
    [
      "Drivers",
      dashboard?.drivers,
      "♙",
    ],
    [
      "Routes",
      dashboard?.routes,
      "⌁",
    ],
    [
      "All trips",
      dashboard?.trips,
      "◷",
    ],
    [
      "Live fleet",
      dashboard?.liveFleet,
      "◉",
    ],
  ];

  return (
    <div className="operator-section">

      <div className="section-intro">

        <div>
          <span>
            OVERVIEW
          </span>

          <h2>
            Operations overview
          </h2>

          <p>
            Monitor your fleet and daily
            operations from one place.
          </p>
        </div>

      </div>


      <div className="dashboard-grid">

        {stats.map(
          ([
            label,
            value,
            icon,
          ]) => (
            <article
              className="stat-card"
              key={label}
            >

              <div className="stat-card-top">

                <span>
                  {label}
                </span>

                <div className="stat-icon">
                  {icon}
                </div>

              </div>

              <strong>
                {value ?? 0}
              </strong>

            </article>
          )
        )}

      </div>


      <div className="wide-card">

        <div className="card-heading">

          <div>
            <h2>
              Currently running
            </h2>

            <p>
              Live trips across your
              fleet.
            </p>
          </div>

          <span className="live-badge">
            ● LIVE
          </span>

        </div>


        {runningTrips.length >
        0 ? (
          <div className="running-trips">

            {runningTrips.map(
              (trip) => (
                <div
                  className="running-trip"
                  key={trip._id}
                >

                  <div className="running-trip-bus">
                    🚌
                  </div>

                  <div>

                    <strong>
                      {
                        trip.bus
                          ?.busNumber ||
                        "Bus"
                      }
                    </strong>

                    <span>
                      {
                        trip.route
                          ?.routeName ||
                        "Route"
                      }
                    </span>

                  </div>

                  <div className="running-trip-driver">

                    <span>
                      Driver
                    </span>

                    <strong>
                      {
                        trip.driver
                          ?.name ||
                        "Assigned"
                      }
                    </strong>

                  </div>

                </div>
              )
            )}

          </div>
        ) : (
          <EmptyState
            icon="🚌"
            title="No buses are currently live"
            text="Running trips will appear here."
          />
        )}

      </div>

    </div>
  );
}


// =====================================================
// BUS SECTION
// =====================================================

function BusSection({
  busForm,
  setBusForm,
  submit,
  buses = [],
}) {
  return (
    <div className="management-layout">

      <Form
        title="Add new bus"
        subtitle="Register a bus to your fleet."
        onSubmit={(event) =>
          submit(
            event,
            "/buses",
            {
              ...busForm,
              totalSeats:
                Number(
                  busForm.totalSeats
                ),
              availableSeats:
                Number(
                  busForm.totalSeats
                ),
            },
            () =>
              setBusForm(
                emptyBus
              ),
            "buses"
          )
        }
        fields={[
          [
            "busNumber",
            "Bus number",
          ],
          [
            "registrationNumber",
            "Registration number",
          ],
          [
            "totalSeats",
            "Total seats",
            "number",
          ],
        ]}
        form={busForm}
        setForm={setBusForm}
      >

        <FieldSelect
          label="Bus type"
          value={busForm.busType}
          onChange={(value) =>
            setBusForm({
              ...busForm,
              busType: value,
            })
          }
          options={[
            ["ordinary", "Ordinary"],
            ["express", "Express"],
            ["ac", "AC"],
            ["electric", "Electric"],
          ]}
        />

      </Form>


      <div className="management-list-panel">

        <ListHeader
          title="Your buses"
          count={buses.length}
        />

        <List
          rows={buses}
          empty="No buses added yet."
          render={(bus) => (
            <>
              <ListMain
                title={bus.busNumber}
                subtitle={
                  bus.registrationNumber
                }
              />

              <ListMeta
                items={[
                  bus.busType,
                  bus.status,
                  `Driver: ${
                    bus.driver?.name ||
                    "Unassigned"
                  }`,
                ]}
              />
            </>
          )}
        />

      </div>

    </div>
  );
}


// =====================================================
// DRIVER SECTION
// =====================================================

function DriverSection({
  driverForm,
  setDriverForm,
  submit,
  drivers = [],
}) {
  return (
    <div className="management-layout">

      <Form
        title="Add new driver"
        subtitle="Create a driver account."
        onSubmit={(event) =>
          submit(
            event,
            "/operators/drivers",
            driverForm,
            () =>
              setDriverForm(
                emptyDriver
              ),
            "drivers"
          )
        }
        fields={[
          [
            "name",
            "Driver name",
          ],
          [
            "email",
            "Email",
            "email",
          ],
          [
            "phone",
            "Phone",
          ],
          [
            "password",
            "Temporary password",
            "password",
          ],
        ]}
        form={driverForm}
        setForm={setDriverForm}
      />


      <div className="management-list-panel">

        <ListHeader
          title="Your drivers"
          count={drivers.length}
        />

        <List
          rows={drivers}
          empty="No drivers added yet."
          render={(driver) => (
            <>
              <ListMain
                title={driver.name}
                subtitle={
                  driver.email
                }
              />

              <ListMeta
                items={[
                  driver.phone,
                  driver.isActive
                    ? "Active"
                    : "Inactive",
                ]}
              />
            </>
          )}
        />

      </div>

    </div>
  );
}


// =====================================================
// ROUTE SECTION
// =====================================================

function RouteSection({
  routeForm,
  setRouteForm,
  submit,
  routes = [],
}) {
  const fields = [
    ["routeName", "Route name"],
    ["routeNumber", "Route number"],
    ["origin", "Origin"],
    ["destination", "Destination"],
    [
      "distanceKm",
      "Distance (km)",
      "number",
    ],
    [
      "estimatedDurationMinutes",
      "Duration (minutes)",
      "number",
    ],
    ["fare", "Fare", "number"],
  ];

  return (
    <div className="management-layout">

      <Form
        title="Add new route"
        subtitle="Create a route for your buses."
        onSubmit={(event) =>
          submit(
            event,
            "/routes",
            {
              ...routeForm,

              distanceKm:
                Number(
                  routeForm.distanceKm
                ),

              estimatedDurationMinutes:
                Number(
                  routeForm.estimatedDurationMinutes
                ),

              fare:
                Number(
                  routeForm.fare
                ),
            },
            () =>
              setRouteForm(
                emptyRoute
              ),
            "routes"
          )
        }
        fields={fields}
        form={routeForm}
        setForm={setRouteForm}
      />


      <div className="management-list-panel">

        <ListHeader
          title="Your routes"
          count={routes.length}
        />

        <List
          rows={routes}
          empty="No routes added yet."
          render={(route) => (
            <>
              <ListMain
                title={`${route.routeName} ${
                  route.routeNumber
                    ? `(${route.routeNumber})`
                    : ""
                }`}
                subtitle={`${route.origin} → ${route.destination}`}
              />

              <ListMeta
                items={[
                  `${route.distanceKm ?? 0} km`,
                  `₹${route.fare ?? 0}`,
                ]}
              />
            </>
          )}
        />

      </div>

    </div>
  );
}


// =====================================================
// TRIP SECTION
// =====================================================

function TripSection({
  tripForm,
  setTripForm,
  submit,
  buses = [],
  drivers = [],
  routes = [],
  trips = [],
  startOrEndTrip,
}) {
  return (
    <div className="trips-section">

      {/* Schedule form */}

      <form
        className="operator-form trip-form"
        onSubmit={(event) =>
          submit(
            event,
            "/trips",
            {
              ...tripForm,

              tripDate:
                new Date(
                  tripForm.tripDate
                ),

              scheduledStartTime:
                new Date(
                  tripForm.scheduledStartTime
                ),
            },
            () =>
              setTripForm(
                emptyTrip
              ),
            "trips"
          )
        }
      >

        <div className="form-header">

          <div>
            <h2>
              Schedule trip
            </h2>

            <p>
              Assign a bus, driver and
              route.
            </p>
          </div>

        </div>


        <div className="trip-form-grid">

          <FieldSelect
            label="Bus"
            required
            value={tripForm.bus}
            onChange={(value) =>
              setTripForm({
                ...tripForm,
                bus: value,
              })
            }
            options={[
              ["", "Select bus"],
              ...buses.map(
                (bus) => [
                  bus._id,
                  bus.busNumber,
                ]
              ),
            ]}
          />


          <FieldSelect
            label="Driver"
            required
            value={tripForm.driver}
            onChange={(value) =>
              setTripForm({
                ...tripForm,
                driver: value,
              })
            }
            options={[
              ["", "Select driver"],
              ...drivers.map(
                (driver) => [
                  driver._id,
                  driver.name,
                ]
              ),
            ]}
          />


          <FieldSelect
            label="Route"
            required
            value={tripForm.route}
            onChange={(value) =>
              setTripForm({
                ...tripForm,
                route: value,
              })
            }
            options={[
              ["", "Select route"],
              ...routes.map(
                (route) => [
                  route._id,
                  route.routeName,
                ]
              ),
            ]}
          />


          <label>
            Trip date

            <input
              required
              type="date"
              value={
                tripForm.tripDate
              }
              onChange={(event) =>
                setTripForm({
                  ...tripForm,
                  tripDate:
                    event.target
                      .value,
                })
              }
            />
          </label>


          <label>
            Scheduled start

            <input
              required
              type="datetime-local"
              value={
                tripForm.scheduledStartTime
              }
              onChange={(event) =>
                setTripForm({
                  ...tripForm,
                  scheduledStartTime:
                    event.target
                      .value,
                })
              }
            />
          </label>

        </div>


        <button
          type="submit"
          className="primary-form-btn"
        >
          Schedule Trip
        </button>

      </form>


      {/* Trips */}

      <div className="management-list-panel">

        <ListHeader
          title="Scheduled trips"
          count={trips.length}
        />

        <List
          rows={trips}
          empty="No trips scheduled yet."
          render={(trip) => (
            <>
              <ListMain
                title={`${
                  trip.bus
                    ?.busNumber ||
                  "Bus"
                } · ${
                  trip.route
                    ?.routeName ||
                  "Route"
                }`}
                subtitle={
                  trip.driver?.name ||
                  "No driver"
                }
              />

              <ListMeta
                items={[
                  trip.status,
                  trip.scheduledStartTime
                    ? new Date(
                        trip.scheduledStartTime
                      ).toLocaleString()
                    : "No time",
                ]}
              />

              <div className="trip-action">

                {trip.status ===
                  "scheduled" && (
                  <button
                    type="button"
                    className="start-btn"
                    onClick={() =>
                      startOrEndTrip(
                        trip,
                        "start"
                      )
                    }
                  >
                    Start Trip
                  </button>
                )}

                {trip.status ===
                  "running" && (
                  <button
                    type="button"
                    className="end-btn"
                    onClick={() =>
                      startOrEndTrip(
                        trip,
                        "end"
                      )
                    }
                  >
                    End Trip
                  </button>
                )}

              </div>
            </>
          )}
        />

      </div>

    </div>
  );
}


// =====================================================
// FLEET SECTION
// =====================================================

function FleetSection({
  fleet = [],
}) {
  return (
    <div className="fleet-section">

      <div className="section-intro">

        <div>
          <span>
            LIVE MONITORING
          </span>

          <h2>
            Live Fleet
          </h2>

          <p>
            Monitor buses currently
            running trips.
          </p>
        </div>

        <span className="live-badge">
          ● LIVE
        </span>

      </div>


      <List
        rows={fleet}
        empty="No live buses at the moment."
        render={(trip) => (
          <>
            <div className="fleet-bus-icon">
              🚌
            </div>

            <ListMain
              title={
                trip.bus?.busNumber ||
                "Bus"
              }
              subtitle={
                trip.route?.routeName ||
                "Route"
              }
            />

            <ListMeta
              items={[
                `Driver: ${
                  trip.driver?.name ||
                  "Assigned"
                }`,
                `${
                  trip.route?.origin ||
                  "Origin"
                } → ${
                  trip.route
                    ?.destination ||
                  "Destination"
                }`,
              ]}
            />

            <span className="live-status">
              ● LIVE
            </span>
          </>
        )}
      />

    </div>
  );
}


// =====================================================
// REPORTS SECTION
// =====================================================

function ReportsSection({
  report,
}) {
  const tripStatus =
    report?.tripStatus || [];

  const totalTrips =
    tripStatus.reduce(
      (total, item) =>
        total +
        Number(item.count || 0),
      0
    );

  return (
    <div className="reports-section">

      <div className="section-intro">

        <div>
          <span>
            ANALYTICS
          </span>

          <h2>
            Reports
          </h2>

          <p>
            Overview of your trip
            operations.
          </p>
        </div>

      </div>


      <div className="report-summary">

        <div className="report-total-card">

          <span>
            Total trips
          </span>

          <strong>
            {totalTrips}
          </strong>

        </div>


        {tripStatus.map(
          (item) => (
            <div
              className="report-status-card"
              key={item._id}
            >

              <span>
                {formatStatus(
                  item._id
                )}
              </span>

              <strong>
                {item.count}
              </strong>

            </div>
          )
        )}

      </div>


      <div className="report-card">

        <div className="card-heading">

          <div>
            <h2>
              Trips by status
            </h2>

            <p>
              Current trip distribution.
            </p>
          </div>

        </div>


        {tripStatus.length > 0 ? (
          <div className="report-bars">

            {tripStatus.map(
              (item) => {

                const percentage =
                  totalTrips > 0
                    ? (
                        Number(
                          item.count
                        ) /
                        totalTrips
                      ) *
                      100
                    : 0;

                return (
                  <div
                    className="report-bar-row"
                    key={item._id}
                  >

                    <div className="report-bar-label">

                      <span>
                        {formatStatus(
                          item._id
                        )}
                      </span>

                      <strong>
                        {item.count}
                      </strong>

                    </div>

                    <div className="report-bar">

                      <div
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>
        ) : (
          <EmptyState
            icon="▥"
            title="No trip data available"
            text="Reports will appear after trips are created."
          />
        )}

      </div>

    </div>
  );
}


// =====================================================
// GENERIC FORM
// =====================================================

function Form({
  title,
  subtitle,
  onSubmit,
  fields,
  form,
  setForm,
  children,
}) {
  return (
    <form
      className="operator-form"
      onSubmit={onSubmit}
    >

      <div className="form-header">

        <div>

          <h2>
            {title}
          </h2>

          {subtitle && (
            <p>
              {subtitle}
            </p>
          )}

        </div>

      </div>


      <div className="form-fields">

        {fields.map(
          ([
            key,
            label,
            type = "text",
          ]) => (
            <label key={key}>

              {label}

              <input
                type={type}
                required
                value={
                  form[key]
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    [key]:
                      event.target
                        .value,
                  })
                }
              />

            </label>
          )
        )}

        {children}

      </div>


      <button
        type="submit"
        className="primary-form-btn"
      >
        Add
      </button>

    </form>
  );
}


// =====================================================
// SELECT
// =====================================================

function FieldSelect({
  label,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <label>

      {label}

      <select
        required={required}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      >

        {options.map(
          ([optionValue, text]) => (
            <option
              key={`${optionValue}-${text}`}
              value={optionValue}
            >
              {text}
            </option>
          )
        )}

      </select>

    </label>
  );
}


// =====================================================
// LIST HEADER
// =====================================================

function ListHeader({
  title,
  count,
}) {
  return (
    <div className="list-header">

      <div>

        <h2>
          {title}
        </h2>

        <p>
          {count} item
          {count !== 1
            ? "s"
            : ""}
        </p>

      </div>

    </div>
  );
}


// =====================================================
// LIST
// =====================================================

function List({
  rows = [],
  render,
  empty = "Nothing to show yet.",
}) {
  if (!rows.length) {
    return (
      <div className="operator-list-empty">

        <div>
          ○
        </div>

        <p>
          {empty}
        </p>

      </div>
    );
  }

  return (
    <div className="operator-list">

      {rows.map((row) => (
        <article
          key={row._id}
          className="operator-list-item"
        >
          {render(row)}
        </article>
      ))}

    </div>
  );
}


// =====================================================
// LIST MAIN
// =====================================================

function ListMain({
  title,
  subtitle,
}) {
  return (
    <div className="list-main">

      <strong>
        {title}
      </strong>

      {subtitle && (
        <span>
          {subtitle}
        </span>
      )}

    </div>
  );
}


// =====================================================
// LIST META
// =====================================================

function ListMeta({
  items = [],
}) {
  return (
    <div className="list-meta">

      {items.map(
        (item, index) => (
          <span
            key={`${item}-${index}`}
          >
            {item}
          </span>
        )
      )}

    </div>
  );
}


// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({
  icon,
  title,
  text,
}) {
  return (
    <div className="empty-state">

      <div className="empty-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}


// =====================================================
// STATUS FORMATTER
// =====================================================

function formatStatus(
  status
) {
  if (!status) {
    return "Unknown";
  }

  return status
    .charAt(0)
    .toUpperCase() +
    status.slice(1);
}


export default OperatorDashboard;