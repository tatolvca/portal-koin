import { Outlet } from 'react-router-dom'
import { KoinHeader } from './portal/KoinHeader'
import { SubnavProteccionCuenta } from './portal/SubnavProteccionCuenta'
import { SubnavContracargos } from './portal/SubnavContracargos'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1600px]">
        <KoinHeader />
        <SubnavProteccionCuenta />
        <SubnavContracargos />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
