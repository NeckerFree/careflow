
import Header from './components/Header'
import DashboardSummary from './components/DashboardSummary'
import PatientList from './components/PatientList'
import { useState } from 'react';

function App()
{
  const [showPatients, setShowPatients] = useState(true);

  return (
    <>
      <Header />
      <main>
        <DashboardSummary />

        <button onClick={() => setShowPatients(prev => !prev)}>
          Toggle Patients
        </button>

        {showPatients && <PatientList />}
      </main>
    </>
  )
}

export default App;
