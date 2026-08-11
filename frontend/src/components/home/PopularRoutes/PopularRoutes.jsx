import "./PopularRoutes.css";
import { FaArrowRight } from "react-icons/fa";

import busBlue from "../../../assets/routes/bus-blue.png";
import busGreen from "../../../assets/routes/bus-green.png";
import busYellow from "../../../assets/routes/bus-yellow.png";

const routes = [
  {
    route: "Bhopal → Indore",
    buses: "32 Buses Available",
    bus: busBlue,
  },
  {
    route: "Indore → Ujjain",
    buses: "18 Buses Available",
    bus: busGreen,
  },
  {
    route: "Bhopal → Agra",
    buses: "24 Buses Available",
    bus: busYellow,
  },
  {
    route: "Indore → Bhopal",
    buses: "28 Buses Available",
    bus: busBlue,
  },
];

function PopularRoutes() {
  return (
    <section className="popular">
      <div className="container">

        <div className="popular-header">
          <div>
            <h2>Popular Routes</h2>
            <span className="line"></span>
          </div>

          <button>
            View All Routes <FaArrowRight />
          </button>
        </div>

        <div className="routes-grid">
          {routes.map((item, index) => (
            <div className="route-card" key={index}>
              <h3>{item.route}</h3>

              <p>{item.buses}</p>

              <img
                src={item.bus}
                className="bus"
                alt={item.route}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default PopularRoutes;