import { LoginPage } from "@/components/LoginPage";
import { getIsZhRequest } from "@/lib/request-locale";

export default async function LoginRoute() {
  const zh = await getIsZhRequest();

  return <LoginPage zh={zh} />;
}
