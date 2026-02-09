"use client";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupportEmailButton() {
  const handleSupportClick = () => {
    window.location.href =
      "mailto:ismpsupport@helpdesk.ellatzite-med.com?subject=ИСМП Портал - Поддръжка&cc=p.penkov@ellatzite-med.com;genadi.tsolov@ellatzite-med.com";
  };

  return (
    <Button variant="outline" size="icon" onClick={handleSupportClick}>
      <Mail className="size-4" />
    </Button>
  );
}
