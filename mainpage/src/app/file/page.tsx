import { Suspense } from "react";
import FilingWizard from "./FilingWizard";

export default function FilePage() {
  return (
    <Suspense fallback={null}>
      <FilingWizard />
    </Suspense>
  );
}
