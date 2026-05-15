import { useState } from "react";
import { useNavigate } from "remix";

export type UrlFormProps = {
  className?: string;
};

export function UrlForm({ className }: UrlFormProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const isButtonDisabled = !inputValue.length || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    try {
      const value = inputValue.trim();
      let target: string;

      if (isUrl(value)) {
        const encodedUrl = encodeURIComponent(value);
        target = `/new?url=${encodedUrl}`;
      } else {
        const base64 = btoa(value);
        target = `/new?j=${base64}`;
      }

      navigate(target);
    } catch {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${className || ""}`}
    >
      <div className="flex">
        <input
          type="text"
          id="jsonUrl"
          className="block flex-grow text-base text-slate-200 placeholder:text-slate-300 bg-slate-900/40 border border-slate-600 rounded-l-sm py-2 px-3 transition duration-300 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter a JSON URL or paste in JSON here..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-r-sm text-white bg-lime-500 transition hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 ${
            isButtonDisabled ? "disabled:opacity-50 disabled:hover:bg-lime-500" : ""
          }`}
        >
          {loading ? "..." : "Go"}
        </button>
      </div>
    </form>
  );
}

function isUrl(possibleUrl: string): boolean {
  try {
    new URL(possibleUrl);
    return true;
  } catch {
    return false;
  }
}
