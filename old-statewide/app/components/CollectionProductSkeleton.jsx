export function CollectionProductSkeleton({count = 8}) {
  return (
    <ul className="mt-[30px] mb-[50px] grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {Array.from({length: count}).map((_, index) => (
        <li key={index} className="border-[1px] border-[#b0b0b0] animate-pulse">
          <div className="w-full aspect-square bg-[#f1f2f2]" />
          <div className="p-3">
            <div className="h-3 w-2/5 bg-[#f1f2f2] mb-2" />
            <div className="h-3 w-full bg-[#f1f2f2] mb-2" />
            <div className="h-3 w-4/5 bg-[#f1f2f2] mb-4" />
            <div className="h-4 w-1/3 bg-[#f1f2f2] mb-3" />
            <div className="h-8 w-full bg-[#e6e7e8]" />
          </div>
        </li>
      ))}
    </ul>
  );
}
