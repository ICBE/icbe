import { actions } from "astro:actions";
import type { JSX, Setter } from "solid-js";
import { createSignal, Show } from "solid-js";
import Button from "#components/ui/Button";
import type { DataProven, DataProvenEntry } from "#schemas";

type SubmitState =
  | { status: "not-started" }
  | { status: "submitting" }
  | { status: "complete"; success: boolean }
  | { status: "error"; error?: string };

const BASE_ELEMENTS = ["earth", "water", "fire", "wind"] as const;
type BASE_ELEMENT = (typeof BASE_ELEMENTS)[number];

const SubmitProvenElementsResultContainer = (props: { state: SubmitState }) => (
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

const SubmitProvenElemenStepCountAndProof = (props: {
  baseElement: BASE_ELEMENT;
  element(): DataProvenEntry;
  setElement: Setter<DataProvenEntry>;
}) => (
  <div>
    <p>{props.baseElement}</p>
    <input
      type="number"
      value={props.element()?.[props.baseElement]?.steps || ""}
      onInput={(e) =>
        props.setElement((prev) => ({
          ...prev,
          [props.baseElement]: {
            ...prev[props.baseElement],
            steps: Number(e.currentTarget.value),
          },
        }))
      }
      placeholder="Steps"
      class="w-24 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
    />
    <input
      type="url"
      value={props.element()?.[props.baseElement]?.proof?.url || ""}
      onInput={(e) =>
        props.setElement((prev) => ({
          ...prev,
          [props.baseElement]: {
            ...prev[props.baseElement],
            proof: { url: e.currentTarget.value },
          },
        }))
      }
      placeholder="Proof URL"
      class="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
    />
  </div>
);

const SubmitProvenElementsForm = (props: {
  element: () => DataProvenEntry;
  setElement: Setter<DataProvenEntry>;
}) => (
  <div class="flex gap-2 items-center">
    <input
      type="text"
      value={props.element().name}
      onInput={(e) =>
        props.setElement((prev) => ({ ...prev, name: e.currentTarget.value }))
      }
      placeholder="Element name"
      class="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
    />

    <SubmitProvenElemenStepCountAndProof
      baseElement="earth"
      element={props.element}
      setElement={props.setElement}
    />
    <SubmitProvenElemenStepCountAndProof
      baseElement="fire"
      element={props.element}
      setElement={props.setElement}
    />
    <SubmitProvenElemenStepCountAndProof
      baseElement="water"
      element={props.element}
      setElement={props.setElement}
    />
    <SubmitProvenElemenStepCountAndProof
      baseElement="wind"
      element={props.element}
      setElement={props.setElement}
    />
  </div>
);

function SubmitProvenElementsSection(): JSX.Element {
  const [elementToBeSubmitted, setElementToBeSubmitted] =
    createSignal<DataProvenEntry>({ name: "" });
  const [submitState, setSubmitState] = createSignal<SubmitState>({
    status: "not-started",
  });

  const handleSubmit = async () => {
    const elements: DataProven = [elementToBeSubmitted()];

    try {
      setSubmitState({ status: "submitting" });
      const result = await actions.elements.submitProvenElements({ elements });
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
      <SubmitProvenElementsForm
        element={elementToBeSubmitted}
        setElement={setElementToBeSubmitted}
      />

      <Button
        onClick={handleSubmit}
        disabled={submitState().status === "submitting"}
        label={
          submitState().status === "submitting"
            ? "Submitting..."
            : "Submit proven Element"
        }
      />

      <SubmitProvenElementsResultContainer state={submitState()} />
    </div>
  );
}

export default SubmitProvenElementsSection;
