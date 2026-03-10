import { Button } from "./Button";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <Button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </Button>
      <span className="text-sm text-slate-600">
        Pagina {page} / {totalPages}
      </span>
      <Button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Siguiente
      </Button>
    </div>
  );
}
