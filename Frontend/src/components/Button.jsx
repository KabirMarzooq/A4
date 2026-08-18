import { Link } from "react-router-dom";

export function Button({ text, to = "/", className = "" }) {
  return (
    <>
      <Link to={to}>
        <button
          className={`relative overflow-hidden bg-cyprus rounded-full py-2 px-4 text-cloud-white group cursor-pointer hidden md:inline-block ${className}`}
        >
          <span className="absolute z-0 w-72 h-72 mt-18 rounded-full group-hover:-mt-28 transition-all ease-linear duration-300 bg-teal-800 -left-5 top-0"></span>
          <span className="relative z-10">{text}</span>
        </button>
      </Link>
    </>
  );
}

export function ButtonB({ text, to = "/", className = "" }) {
  return (
    <>
      <Link to={to}>
        <button
          className={`relative hidden sm:inline-block overflow-hidden border-2 border-cyprus rounded-full py-4 px-7 text-cloud-white group cursor-pointer ${className}`}
        >
          <span className="absolute z-0 w-72 h-72 mt-18 rounded-full group-hover:-mt-28 transition-all ease-linear duration-300 bg-teal-800 -left-5 top-0"></span>
          <span className="relative z-10 font-bold">{text}</span>
        </button>
      </Link>
    </>
  );
}

export function ButtonC({ text, to = "/", className = "" }) {
  return (
    <>
      <Link to={to}>
        <button
          className={`relative overflow-hidden bg-teal-800 py-4 px-7 text-cloud-white group cursor-pointer inline-block rounded-full ${className}`}
        >
          <span className="absolute z-0 w-72 h-72 mt-18 rounded-full group-hover:-mt-28 transition-all ease-linear duration-300 bg-cyprus -left-5 top-0"></span>
          <span className="relative z-10 font-bold">{text}</span>
        </button>
      </Link>
    </>
  );
}

export function ButtonD({
  text,
  to = "/services",
  className = "",
  active = false,
  onClick,
}) {
  return (
    <Link to={to}>
      <button
        onClick={onClick}
        className={`
        relative inline-block overflow-hidden rounded-full py-4 px-8 group cursor-pointer font-bold
        border-2 transition-all duration-200
        ${
          active
            ? "bg-teal-800 text-white border-teal-800"
            : "text-cyprus border-cyprus hover:border-teal-800 hover:text-white dark:text-white"
        }
        ${className}
      `}
      >
        {!active && (
          <span className="absolute z-0 w-72 h-72 -translate-y-20 -translate-x-45 rounded-full group-hover:translate-x-20 transition-all ease-linear duration-500 bg-teal-800 right-0 top-0"></span>
        )}
        <span className="relative z-10">{text}</span>
      </button>
    </Link>
  );
}