import "./HowItWorks.css";

import {
  FaDownload,
  FaSearch,
  FaMapMarkerAlt,
  FaBell,
} from "react-icons/fa";

const steps = [
  {
    icon: <FaDownload />,
    title: "Download the App",
    desc: "Bus Mitra app download karein Play Store se.",
  },
  {
    icon: <FaSearch />,
    title: "Search Your Bus",
    desc: "Bus number ya route se apni bus khojiye.",
  },
  {
    icon: <FaMapMarkerAlt />,
    title: "Track Live Location",
    desc: "Bus ki live location map par dekhein.",
  },
  {
    icon: <FaBell />,
    title: "Get Notified",
    desc: "Apne stop se pehle alert paakar tayyar rahein.",
  },
];

function HowItWorks() {
  return (
    <section className="how">
      <div className="container">

        <div className="how-box">

          <h2>How Bus Mitra Works?</h2>

          <span className="underline"></span>

          <div className="steps">

            {steps.map((step, index) => (

              <div className="step" key={index}>

                <div className="icon-circle">
                  {step.icon}
                </div>

                <span className="step-number">
                  {index + 1}
                </span>

                <h3>{step.title}</h3>

                <p>{step.desc}</p>

              </div>

            ))}

          </div>

        </div>

      </div>
    </section>
  );
}

export default HowItWorks;