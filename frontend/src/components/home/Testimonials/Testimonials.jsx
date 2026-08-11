import "./Testimonials.css";
import { FaStar } from "react-icons/fa";

const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    city: "Bhopal",
    image: "/images/users/user1.jpg",
    review:
      "Bus Mitra saved me a lot of waiting time. Live tracking is very accurate."
  },
  {
    id: 2,
    name: "Priya Patel",
    city: "Indore",
    image: "/images/users/user2.jpg",
    review:
      "Finally a platform where I can track private buses. Amazing experience."
  },
  {
    id: 3,
    name: "Amit Verma",
    city: "Rajgarh",
    image: "/images/users/user3.jpg",
    review:
      "Simple UI, fast tracking and very useful for daily passengers."
  }
];

function Testimonials() {

  return (

    <section className="testimonials">

      <div className="container">

        <div className="section-heading">

          <span>TESTIMONIALS</span>

          <h2>
            What Our Users Say
          </h2>

          <p>
            Thousands of passengers trust Bus Mitra every day.
          </p>

        </div>

        <div className="testimonial-grid">

          {testimonials.map((item) => (

            <div
              className="testimonial-card"
              key={item.id}
            >

              <img
                src={item.image}
                alt={item.name}
              />

              <h3>{item.name}</h3>

              <small>{item.city}</small>

              <div className="stars">

                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />

              </div>

              <p>{item.review}</p>

            </div>

          ))}

        </div>

      </div>

    </section>

  );

}

export default Testimonials;