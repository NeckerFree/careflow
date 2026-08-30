import Card from "./Card";
import "../App.css"

export default function DashboardSummary()
{
    console.log("DashboardSummary rendered");
    return (
        <div className="dashboard-summary">
            <Card>
                <h2>Active Patients</h2>
                <p>248</p>
            </Card>
            <Card>
                <h2>Today's Appointments</h2>
                <p>36</p>
            </Card>
            <Card>
                <h2>Critical Cases</h2>
                <p>7</p>
            </Card>
        </div>
    )
}