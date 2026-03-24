import { actions } from "astro:actions";
import type { JSX } from "solid-js";
import { createSignal, Show } from "solid-js";
import Button from "#components/ui/Button";

type SubmitState =
  | { status: "not-started" }
  | { status: "submitting" }
  | { status: "complete"; success: boolean }
  | { status: "error"; error?: string };

const SubmitDisprovenElementsResultContainer = (props: {
  state: SubmitState;
}) => (
  <Show when={props.state.status === "complete" && props.state} keyed>
    {(state) => (
      <p
        class={`mt-4 p-4 rounded-md ${
          state.success
            ? "bg-green-50 dark:bg-green-950"
            : "bg-red-50 dark:bg-red-950"
        }`}
      >
        {state.success
          ? "Elements submitted successfully!"
          : "Elements submission failed."}
      </p>
    )}
  </Show>
);

function SubmitDisprovenElementsSection(): JSX.Element {
  const [elementsToBeSubmitted, setElementsToBeSubmitted] = createSignal<
    string[]
  >([]);
  const [submitState, setSubmitState] = createSignal<SubmitState>({
    status: "not-started",
  });

  const handleSubmit = async () => {
    try {
      setSubmitState({ status: "submitting" });
      const disprovenElements = elementsToBeSubmitted().map((name) => ({
        name,
      }));
      const result = await actions.elements.submitDisprovenElements({
        elements: disprovenElements,
      });
      if (result.error) {
        console.error("Submit failed:", result.error);
        setSubmitState({ status: "error", error: result.error.message });
      } else {
        setSubmitState({ status: "complete", success: result.data.success });
      }
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitState({ status: "error" });
    }
  };

  return (
    <div class="flex flex-col gap-4">
      <textarea
        class="text-white p-1 min-h-64"
        placeholder="Enter disproven elements, one per line"
        data-1p-ignore
        onInput={(e) =>
          setElementsToBeSubmitted(
            e.currentTarget.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
      />

      <Button
        onClick={handleSubmit}
        disabled={
          submitState().status === "submitting" ||
          elementsToBeSubmitted().length === 0
        }
        label={
          submitState().status === "submitting"
            ? "Submitting..."
            : elementsToBeSubmitted().length
              ? `Submit disproven Elements (${elementsToBeSubmitted().length})`
              : "Submit disproven Elements"
        }
      />

      <SubmitDisprovenElementsResultContainer state={submitState()} />
    </div>
  );
}

export default SubmitDisprovenElementsSection;
