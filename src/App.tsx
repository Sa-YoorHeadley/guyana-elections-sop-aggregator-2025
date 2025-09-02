import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";

type Votes = {
  APNU: number;
  AFC: number;
  FGM: number;
  ALP: number;
  PPP: number;
  WIN: number;
};

type SopRow = {
  sopId: string;
  region: string;
  regionName: string;
  station: string;
  votes: Votes;
};

function App() {
  const [data, setData] = useState<SopRow[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/sops");
        const json: { count: number; sops: SopRow[]; lastUpdated: string } =
          await res.json();
        console.log(json);
        const isoString = json.lastUpdated;
        const dateObject = new Date(isoString);
        const readableDate = dateObject.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        });
        setLastUpdated(readableDate);
        setCount(json.count);
        setData(json.sops);
      } catch (err) {
        console.error("Error loading SOPs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group SOPs by region
  const regionsMap = data.reduce(
    (map: Map<string, { name: string; sops: SopRow[] }>, row) => {
      if (!map.has(row.region))
        map.set(row.region, { name: row.regionName, sops: [] });
      map.get(row.region)!.sops.push(row);
      return map;
    },
    new Map()
  );

  const regions = Array.from(regionsMap.entries()); // [ [regionNumber, {name, sops}], ... ]

  // Calculate total votes
  const totals: Votes = data.reduce(
    (acc, row) => {
      acc.APNU += row.votes.APNU;
      acc.AFC += row.votes.AFC;
      acc.FGM += row.votes.FGM;
      acc.ALP += row.votes.ALP;
      acc.PPP += row.votes.PPP;
      acc.WIN += row.votes.WIN;
      return acc;
    },
    { APNU: 0, AFC: 0, FGM: 0, ALP: 0, PPP: 0, WIN: 0 }
  );

  if (loading) return <p>Loading...</p>;
  if (!data.length) return <p>No SOP data available.</p>;

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">
        Guyana 2025 Elections - SOP Aggregator based on data from{" "}
        <a
          className="underline text-blue-500"
          href="https://www.stabroeknews.com/2025/09/02/news/guyana/guyana-elections-results-2025-statements-of-poll/"
        >
          Stabroek News
        </a>{" "}
        by{" "}
        <a
          className="underline text-blue-500"
          href="https://github.com/Sa-YoorHeadley/"
        >
          Sa-Yoor Headley
        </a>
      </h1>
      <h2 className="text-xl mb-4">
        Last Updated @ <span className="font-semibold">{lastUpdated}</span>
      </h2>
      <h3 className="mb-4">Total Records {count}</h3>

      <Tabs defaultValue={regions[0]?.[0] || "total"}>
        <TabsList className="flex flex-wrap gap-2 mb-4">
          {regions.map(([region]) => (
            <TabsTrigger key={region} value={region}>
              {`Region ${region}`}
            </TabsTrigger>
          ))}
          <TabsTrigger value="total">Total</TabsTrigger>
        </TabsList>

        {regions.map(([region, { sops }]) => (
          <TabsContent key={region} value={region}>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Station</TableHead>
                  <TableHead>SOP ID</TableHead>
                  <TableHead>APNU</TableHead>
                  <TableHead>AFC</TableHead>
                  <TableHead>FGM</TableHead>
                  <TableHead>ALP</TableHead>
                  <TableHead>PPP</TableHead>
                  <TableHead>WIN</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sops.map((row) => (
                  <TableRow key={row.sopId}>
                    <TableCell>{row.station}</TableCell>
                    <TableCell>{row.sopId}</TableCell>
                    <TableCell>{row.votes.APNU}</TableCell>
                    <TableCell>{row.votes.AFC}</TableCell>
                    <TableCell>{row.votes.FGM}</TableCell>
                    <TableCell>{row.votes.ALP}</TableCell>
                    <TableCell>{row.votes.PPP}</TableCell>
                    <TableCell>{row.votes.WIN}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}

        {/* Total Tab */}
        <TabsContent value="total">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>APNU</TableHead>
                <TableHead>AFC</TableHead>
                <TableHead>FGM</TableHead>
                <TableHead>ALP</TableHead>
                <TableHead>PPP</TableHead>
                <TableHead>WIN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{totals.APNU}</TableCell>
                <TableCell>{totals.AFC}</TableCell>
                <TableCell>{totals.FGM}</TableCell>
                <TableCell>{totals.ALP}</TableCell>
                <TableCell>{totals.PPP}</TableCell>
                <TableCell>{totals.WIN}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <small className="text-center">
        This app is still in development and is subject to change
      </small>
    </div>
  );
}

export default App;
