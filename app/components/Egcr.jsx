import { useMatches } from 'react-router';

export function EGRC({ page }) {
    return (
        <>
            <div className="max-w-[1140px] px-[15px] mx-auto my-[50px]">
                <div className="w-full mt-[20px]">
                    <h1 className="text-[#1e5097] mb-[25px] text-center text-[24px] font-bold py-[6px] border-b-[1px] border-b-[#ccc]">
                        <span className="mb-[8px] block">Thank you</span>
                    </h1>
                </div>
                <div className="w-full text-center">
                    <p>
                        By opting in, Google Customer Reviews may send you a brief questionnaire via email, allowing you to rate your purchase experience with us.
                    </p>
                </div>
            </div>
        </>
    );
}
