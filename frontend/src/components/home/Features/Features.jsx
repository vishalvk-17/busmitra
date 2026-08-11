import "./Features.css";
import {
  FaWifi,
  FaClock,
  FaBell,
  FaUsers,
} from "react-icons/fa";

const features = [
  {
    icon: <FaWifi />,
    title: "Live Tracking",
    desc: "Har bus ki real-time location dekhein.",
    color: "#2F80ED",
  },
  {
    icon: <FaClock />,
    title: "ETA & Timings",
    desc: "Pata karein bus kitni der mein pahunchegi.",
    color: "#27AE60",
  },
  {
    icon: <FaBell />,
    title: "Stop Alerts",
    desc: "Aapka stop aane se pehle notification paayein.",
    color: "#8B5CF6",
  },
  {
    icon: <FaUsers />,
    title: "All Buses, One App",
    desc: "Private, rural aur city buses ek hi jagah.",
    color: "#F2994A",
  },
];

function Features() {
  return (
    <section className="features">
      <div className="container">
        <div className="features-wrapper">
          {features.map((item, index) => (
            <div className="feature-card" key={index}>
              <div
                className="feature-icon"
                style={{ background: item.color }}
              >
                {item.icon}
              </div>

              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;