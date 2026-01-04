import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  // const test = await api.admin.permissions.getForUser({
  //   username: "genadi.tsolov@ellatzite-med.com",
  //   mainMenu: "DMA",
  // });

  // console.log(test);

  return (
    <HydrateClient>
      <AppLayout>
        <Container title="Home">
          <div>
            <h1>Home</h1>
          </div>
        </Container>
      </AppLayout>
    </HydrateClient>
  );
}
