// Travel pages own their headers and navigation, including the planner's
// fixed action footer. Never wrap these routes in the catering shell.
export default function TravelLayout({ children }: { children: React.ReactNode }) {
  return <div data-service="travel">{children}</div>;
}
