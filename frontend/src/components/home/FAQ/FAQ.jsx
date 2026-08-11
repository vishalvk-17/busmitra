import "./FAQ.css";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const faqData = [
  {
    id: 1,
    question: "What is Bus Mitra?",
    answer:
      "Bus Mitra is a live bus tracking platform that helps passengers track private and rural buses in real time."
  },
  {
    id: 2,
    question: "Is live location accurate?",
    answer:
      "Yes. We use GPS-based tracking to provide accurate live bus locations and estimated arrival times."
  },
  {
    id: 3,
    question: "Can I track private buses?",
    answer:
      "Yes. Bus Mitra is specially designed for private and rural bus operators."
  },
  {
    id: 4,
    question: "Is Bus Mitra free?",
    answer:
      "Yes. Passengers can use Bus Mitra completely free."
  }
];

function FAQ() {

  const [active, setActive] = useState(1);

  const toggleFAQ = (id) => {
    setActive(active === id ? null : id);
  };

  return (

    <section className="faq">

      <div className="container">

        <div className="section-heading">

          <span>FAQ</span>

          <h2>Frequently Asked Questions</h2>

          <p>
            Everything you need to know about Bus Mitra.
          </p>

        </div>

        <div className="faq-list">

          {faqData.map((item) => (

            <div
              className={`faq-item ${
                active === item.id ? "active" : ""
              }`}
              key={item.id}
            >

              <div
                className="faq-question"
                onClick={() => toggleFAQ(item.id)}
              >

                <h3>{item.question}</h3>

                <FaChevronDown />

              </div>

              {active === item.id && (

                <div className="faq-answer">

                  <p>{item.answer}</p>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

    </section>

  );

}

export default FAQ;