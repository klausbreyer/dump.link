import InfoButton from "../common/InfoButton";

export default function Dashboard() {
  return (
    <div>
      <InfoButton color="indigo" onClick={() => "/login"}>
        Login
      </InfoButton>
    </div>
  );
}
