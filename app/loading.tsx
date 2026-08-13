export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-4 xl:col-span-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-36 rounded-2xl bg-paper-2" />
            <div className="h-36 rounded-2xl bg-paper-2" />
          </div>
          <div className="h-72 rounded-2xl bg-paper-2" />
        </div>
        <div className="col-span-12 h-[28rem] rounded-2xl bg-paper-2 xl:col-span-7" />
        <div className="col-span-12 h-80 rounded-2xl bg-paper-2" />
      </div>
    </div>
  );
}
