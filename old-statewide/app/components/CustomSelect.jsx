import React, { useState, useEffect, useRef } from "react";

const CustomSelect = ({
  showBorder,
  setUserSelected,
  id,
  onChange,
  value = null,
  placeholder,
  index, // Algolia index instance
  handleGetFacetValues,
  filterName,
  query="",
  options = [] // initial options
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value);
  const [searchTerm, setSearchTerm] = useState("");
  const [facetOptions, setFacetOptions] = useState(options); // start with initial options
  const dropdownRef = useRef(null);

  // Keep selection in sync with parent
  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  // Reset facetOptions to initial options when searchTerm is cleared
  useEffect(() => {
    if (!searchTerm) {
      setFacetOptions(options);
    }
  }, [searchTerm, options]);

  // Fetch facet values when searchTerm changes
  useEffect(() => {
    if (!searchTerm || !index) return;

    let active = true;

    const fetchFacetValues = async () => {
      try {
        const facetFilters = handleGetFacetValues
          ? handleGetFacetValues(searchTerm)
          : [];

        const obj = { 
          facetFilters,
          typoTolerance: false
         };

        if(query && query != "") {
          obj.query = query;
        }

        const data = await index.searchForFacetValues(
          filterName,
          searchTerm,
          obj
        );

        if (active) {
          const mapped = data.facetHits
            .filter(
              (hit) =>
                hit.value.toLowerCase() !== "please select" &&
                hit.value.toLowerCase() !== "n/a"
            )
            .map((hit) => ({
              label: hit.value,
              highlighted: hit.highlighted,
              count: hit.count,
              value: hit.value,
            }));

          setFacetOptions(mapped); // overwrite options with facet search results
        }
      } catch (err) {
        console.error("Error fetching facet values:", err);
        if (active) setFacetOptions([]);
      }
    };

    fetchFacetValues();

    return () => {
      active = false;
    };
  }, [searchTerm, index, handleGetFacetValues, filterName]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onChange(option);
    setUserSelected?.(true);
  };

  const handleClearSelection = () => {
    setSelectedOption(null);
    setSearchTerm("");
    onChange(null);
    setUserSelected?.(false);
  };

  return (
    <div className="custom-select-container" ref={dropdownRef}>
      <div
        id={id}
        className={`selected-value ${showBorder ? "highlight " : ""} ${
          selectedOption ? "text-[#444]" : "text-[#999]"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <>
            <span className="text-[#444] label selected-value-label">
              {selectedOption.label}
            </span>
            <span
              className="clear-icon"
              onClick={(e) => {
                e.stopPropagation();
                handleClearSelection();
              }}
            >
              ✕
            </span>
          </>
        ) : (
          <span className="text-[#999] label selected-value-label">
            {placeholder}
          </span>
        )}
        <span className={`arrow ${isOpen ? "up" : "down"}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="transparent"
            stroke="currentColor"
            className="transition rotate-0 w-8 h-8"
          >
            <path d="M14 8L10 12L6 8" strokeWidth="1.25"></path>
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="options">
          <div className="search-input-wrap">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search..."
              className="search-input"
            />
          </div>

          {facetOptions.length > 0 ? (
            facetOptions.map((option) => (
              <div
                key={option.value}
                className={`truncate text-[14.4px] option ${
                  selectedOption?.label === option?.label
                    ? "bg-[#5897fb] text-[#fff]"
                    : ""
                }`}
                onClick={() => handleOptionSelect(option)}
              >
                {option.label}
                {/* <span
                  dangerouslySetInnerHTML={{ __html: option.highlighted || option.label }}
                ></span> */}

              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 p-2">No results</div>
          )}
        </div>
      )}
    </div>
  );
};

export { CustomSelect };
