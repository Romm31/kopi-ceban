import LoginForm from "@/components/form/LoginForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Login | Kopi Ceban",
  description: "Login to Kopi Ceban Admin Panel",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-2">Enter your credentials to access the dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
