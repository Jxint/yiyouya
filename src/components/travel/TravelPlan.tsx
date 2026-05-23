interface TravelPlanProps {
  plan: string[];
}

export function TravelPlan({ plan }: TravelPlanProps) {
  return (
    <section className="panel">
      <h2>旅行计划</h2>
      <ol className="plan-list">
        {plan.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}
