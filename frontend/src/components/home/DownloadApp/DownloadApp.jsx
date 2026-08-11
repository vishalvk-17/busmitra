import "./DownloadApp.css";

import {
  FaMobileAlt
} from "react-icons/fa";

import googlePlay from "../../../assets/images/google-play.png";
import appStore from "../../../assets/images/app-store.png";

function DownloadApp() {
  return (
    <section className="download-app">

      <div className="container">

        <div className="download-card">

          {/* Left */}

          <div className="download-left">

            <div className="mobile-icon">
              <FaMobileAlt />
            </div>

            <div>

              <h2>Bus Mitra App Download Karein</h2>

              <p>
                India ke har route ki har bus ki live location,
                ab aapke phone par.
              </p>

            </div>

          </div>

          {/* Right */}

          <div className="download-right">

            <img
              src={googlePlay}
              alt="Google Play"
            />

            <img
              src={appStore}
              alt="App Store"
            />

          </div>

        </div>

      </div>

    </section>
  );
}

export default DownloadApp;