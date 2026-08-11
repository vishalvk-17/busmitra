import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import routeService from "../../services/routeService";

export default function RouteDetails() {
  const { id } = useParams();
  const [route, setRoute] = useState(null);

  useEffect(() => {
    routeService.getRouteById(id)
      .then((data) => setRoute(data.route))
      .catch(() => setRoute(null));
  }, [id]);

  if (!route) return <main style={{ padding: "120px 5%" }}>Loading route...</main>;

  return <main style={{ padding: "120px 5%" }}>
    <h1>{route.routeName}</h1>
    <p>{route.origin} → {route.destination}</p>
    <p>{route.distanceKm} km · ₹{route.fare}</p>
  </main>;
}
