import { useNavigate } from "remix";

export function ExampleUrl({
  url,
  title,
  displayTitle,
}: {
  url: string;
  title: string;
  displayTitle?: string;
}) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const encodedUrl = encodeURIComponent(url);
    navigate(`/new?url=${encodedUrl}&utm_source=example_url`);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-slate-900 px-4 py-2 rounded-md whitespace-nowrap text-lime-300 transition hover:text-lime-500"
    >
      {displayTitle ?? title}
    </button>
  );
}
