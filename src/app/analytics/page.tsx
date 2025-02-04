import Chart from './components/chart'

export default function Analytics() {
  return (
    <div className="container py-4 px-8">
        <div className="title">
            <h1>Home &gt; Analytics</h1>
        </div>
        <div className="content text-xl font-bold my-4">
            <h1>Overview</h1>
        </div>
        <Chart/>
    </div>
  );
}
