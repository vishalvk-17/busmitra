import "./Footer.css";

import {
  FaBusAlt,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Footer() {

  return (

    <footer className="footer">

      <div className="container">

        <div className="footer-grid">

          {/* Company */}

          <div className="footer-column">

            <div className="footer-logo">

              <FaBusAlt />

              <span>Bus Mitra</span>

            </div>

            <p>

              India's smart platform for tracking
              private and rural buses in real time.

            </p>

            <div className="social-icons">

              <a href="#">

                <FaFacebookF />

              </a>

              <a href="#">

                <FaInstagram />

              </a>

              <a href="#">

                <FaTwitter />

              </a>

              <a href="#">

                <FaLinkedinIn />

              </a>

            </div>

          </div>

          {/* Quick Links */}

          <div className="footer-column">

            <h3>Quick Links</h3>

            <ul>

              <li>Home</li>

              <li>Track Bus</li>

              <li>Routes</li>

              <li>Download App</li>

              <li>Contact</li>

            </ul>

          </div>

          {/* Support */}

          <div className="footer-column">

            <h3>Support</h3>

            <ul>

              <li>Help Center</li>

              <li>Privacy Policy</li>

              <li>Terms & Conditions</li>

              <li>FAQs</li>

              <li>Report Issue</li>

            </ul>

          </div>

          {/* Contact */}

          <div className="footer-column">

            <h3>Contact</h3>

            <ul className="contact-list">

              <li>

                <FaEnvelope />

                support@busmitra.in

              </li>

              <li>

                <FaPhoneAlt />

                +91 98765 43210

              </li>

              <li>

                <FaMapMarkerAlt />

                Bhopal, Madhya Pradesh

              </li>

            </ul>

          </div>

        </div>

        <div className="footer-bottom">

          <p>

            © 2026 Bus Mitra. All Rights Reserved.

          </p>

        </div>

      </div>

    </footer>

  );

}

export default Footer;