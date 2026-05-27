
import React from 'react';
import { Schedule } from '@/types/models';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleRowProps {
  schedule: Schedule;
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (scheduleId: string) => void;
}

const ScheduleRow: React.FC<ScheduleRowProps> = ({ schedule, onEdit, onDelete }) => {
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const getStatusColor = (status: Schedule['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <tr className="hover:bg-muted/50">
      <td className="p-3 border-t border-border">
        <div className="font-medium">{schedule.route.name}</div>
        <div className="text-xs text-muted-foreground">{schedule.route.code}</div>
      </td>
      <td className="p-3 border-t border-border">
        <div className="font-medium">{formatDateTime(schedule.departureTime)}</div>
        <div className="text-xs text-muted-foreground">
          From: {schedule.route.stations[0].name}
        </div>
      </td>
      <td className="p-3 border-t border-border">
        <div className="font-medium">{formatDateTime(schedule.arrivalTime)}</div>
        <div className="text-xs text-muted-foreground">
          To: {schedule.route.stations[schedule.route.stations.length - 1].name}
        </div>
      </td>
      <td className="p-3 border-t border-border">
        <Badge 
          variant="outline" 
          className={cn("capitalize", getStatusColor(schedule.status))}
        >
          {schedule.status}
        </Badge>
      </td>
      <td className="p-3 border-t border-border text-center">
        <div className="font-medium">{schedule.availableSeats}</div>
        <div className="text-xs text-muted-foreground">of {schedule.totalSeats}</div>
      </td>
      <td className="p-3 border-t border-border text-right">
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit && onEdit(schedule)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete && onDelete(schedule.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default ScheduleRow;
