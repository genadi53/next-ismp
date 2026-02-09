import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";

export default async function DomainPermissionsPage() {
  return (
    <AppLayout>
      <Container
        title="Domain Permissions"
        description="Управление на домейн права"
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Домейн групи</CardTitle>
            <CardDescription>
              Управление на домейн права за потребители
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Страницата за управление на домейн права ще бъде имплементирана
                в следващ етап.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </Container>
    </AppLayout>
  );
}
