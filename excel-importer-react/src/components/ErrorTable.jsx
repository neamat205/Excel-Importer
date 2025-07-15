const ErrorTable = ({ errors }) => {
  return (
    <div className="max-h-64 overflow-auto border border-gray-300 rounded-md mt-4">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-200 sticky top-0 z-10">
          <tr>
            <th className="p-2 border">Row</th>
            <th className="p-2 border">Column</th>
            <th className="p-2 border">Message</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((error, idx) => (
            <tr key={idx} className="bg-white border">
              <td className="p-2 border text-center">{error.row}</td>
              <td className="p-2 border text-center">{error.column}</td>
              <td className="p-2 border">{error.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ErrorTable;
