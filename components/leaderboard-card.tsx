import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic } from "lucide-react";

interface Speaker {
  id: string;
  name: string;
  team: string;
  count: number;
}

interface LeaderboardCardProps {
  title: string;
  data: Speaker[];
  iconColor: string;
  caption: string;
}

export function LeaderboardCard({
  title,
  data,
  iconColor,
  caption,
}: LeaderboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className={`h-6 w-6 ${iconColor}`} />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>{caption}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Posición</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead className="text-right">Menciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {index === 0 ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full">
                      1
                    </span>
                  ) : index === 1 ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-200 text-slate-800 rounded-full">
                      2
                    </span>
                  ) : index === 2 ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-800 rounded-full">
                      3
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-800 rounded-full">
                      {index + 1}
                    </span>
                  )}
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.team}</TableCell>
                <TableCell className="text-right font-semibold">
                  {item.count}
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
