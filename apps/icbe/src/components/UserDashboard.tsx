import { type JSX, Show } from "solid-js";

import SubmitDisprovenElementsSection from "./dashboard/SubmitDisprovenElementsSection";
import SubmitProvenElementsSection from "./dashboard/SubmitProvenElementsSection";
import Divider from "./ui/Divider";
import Link from "./ui/Link";

const TopBar = (): JSX.Element => (
  <div class="flex items-center justify-between pb-4">
    <h1 class="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
      User Dashboard
    </h1>
  </div>
);

export default function UserDashboard(props: {
  canSubmitElements: boolean;
}): JSX.Element {
  const isAdmin = false;

  return (
    <div class="p-6 min-h-screen flex flex-col">
      <TopBar />
      <Show when={isAdmin}>
        <Divider />
        <Link
          href="/admin/dashboard"
          color="blue"
          label="Open Admin Dashboard"
        />
      </Show>
      <Show when={props.canSubmitElements}>
        <Divider />
        <SubmitDisprovenElementsSection />
        <Divider />
        <SubmitProvenElementsSection />
      </Show>
    </div>
  );
}
