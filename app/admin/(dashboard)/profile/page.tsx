import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import ChangePasswordForm from "./ChangePasswordForm"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      <ChangePasswordForm username={session?.user?.name || ""} />
    </div>
  )
}
