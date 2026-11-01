const WarningPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800/50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Please choose carefully</h2>
        <p className="text-sm mb-4">
          PCB's are not returnable unless they are faulty or do not match the description. If you are unsure that you have the correct part please contact us.
        </p>
        <div className="flex justify-between">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-sm hover:bg-gray-700">CANCEL</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-700">CONTINUE</button>
        </div>
      </div>
    </div>
  );
};

export { WarningPopup };