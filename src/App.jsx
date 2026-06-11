import { useState, useEffect } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "motion/react";
import "./App.css";

// CSV URL for employee data
const employeeCSV = "https://www.tamuk.edu/_wp_dir_feed/directory-feed.csv";

function App() {
  const [employees, setEmployees] = useState([]);
  const [lastNameQuery, setLastNameQuery] = useState("");
  const [firstNameQuery, setFirstNameQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [employeesPerPage] = useState(20); // Number of employees to display per page
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [debouncedLastNameQuery, setDebouncedLastNameQuery] =
    useState(lastNameQuery);
  const [debouncedFirstNameQuery, setDebouncedFirstNameQuery] =
    useState(firstNameQuery);
  const [debouncedDepartmentFilter, setDebouncedDepartmentFilter] =
    useState(departmentFilter);

  // Function to load CSV data and parse it
  const loadEmployees = () => {
    Papa.parse(employeeCSV, {
      download: true,
      header: true,
      complete: function (results) {
        setEmployees(results.data);
      },
    });
  };


  // Function to apply the filter based on search queries
  const filteredEmployees = employees.filter((employee) => {
    const matchesLastName = employee.last_name
      .toLowerCase()
      .includes(debouncedLastNameQuery.toLowerCase());
    const matchesFirstName = employee.first_name
      .toLowerCase()
      .includes(debouncedFirstNameQuery.toLowerCase());
    const matchesDepartment = debouncedDepartmentFilter
      ? employee.department
        ?.toLowerCase()
        .includes(debouncedDepartmentFilter.toLowerCase())
      : true;

    return matchesLastName && matchesFirstName && matchesDepartment;
  });

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee,
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(filteredEmployees.length / employeesPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }

  // Load employees data on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  // Handle debouncing of the search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLastNameQuery(lastNameQuery);
      setDebouncedFirstNameQuery(firstNameQuery);
      setDebouncedDepartmentFilter(departmentFilter);
    }, 500); // Debounce delay (500ms)

    return () => clearTimeout(timer); // Cleanup timer on change
  }, [lastNameQuery, firstNameQuery, departmentFilter]);

  // Get unique department names and sort them
  const departments = [
    ...new Set(
      employees.map((employee) => employee.department).filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));

  // Function to reset all filters
  const resetFilters = () => {
    setLastNameQuery("");
    setFirstNameQuery("");
    setDepartmentFilter("");
    setCurrentPage(1); // Reset to first page
  };

  return (
    <>
      <div className="App container py-5">
        <h1 className="my-4">Campus Directory</h1>
        <p>
          To update your contact information in the directory, you will need to
          log in to Workday. In order for the changes to be reflected in the
          Campus Directory, information must be updated exactly as indicated in
          the{" "}
          <a
            href="https://www.tamuk.edu/finance/its/support/update-campus-directory.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            instructions
          </a>
          . E-mail addresses are maintained by ITS. If your e-mail address is
          incorrect, please call the ITS HelpDesk at{" "}
          <a href="tel:3615934357">(361) 593-4357</a>.
        </p>

        <div className="row">
          <div className="col-md-6">
            {/* First Name Input */}
            <label htmlFor="firstNameSearch">First Name</label>
            <input
              id="firstNameSearch"
              type="text"
              className="form-control mb-3"
              placeholder="Enter first name"
              value={firstNameQuery}
              onChange={(e) => {
                setFirstNameQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="col-md-6">
            {/* Last Name Input */}
            <label htmlFor="lastNameSearch">Last Name</label>
            <input
              id="lastNameSearch"
              type="text"
              className="form-control mb-3"
              placeholder="Enter last name"
              value={lastNameQuery}
              onChange={(e) => {
                setLastNameQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Department Dropdown */}
        <label htmlFor="departmentSelect">Department</label>
        <select
          id="departmentSelect"
          className="form-control mb-3"
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Choose a department</option>
          {departments.map((department, index) => (
            <option key={index} value={department}>
              {department}
            </option>
          ))}
        </select>

        {/* Filters & Result Count */}
        <div className="row justify-content-end align-content-center">
          <div className="col-auto">
            <p>{`Showing ${filteredEmployees.length} result(s)`}</p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-sm btn-secondary"
              onClick={resetFilters}
              aria-label="Reset filters"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Employee List */}
        <div className="row employee-wrapper">
          <AnimatePresence mode="popLayout">
            {currentEmployees.length === 0 ? (
              <div className="col-12 my-2 p-3 rounded">
                <h2 role="alert">
                  No results found! Try adjusting your search criteria.
                </h2>
              </div>
            ) : (
              currentEmployees.map((employee, index) => (
                <motion.div
                  key={employee._id}
                  className="col-12 my-2 p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    delay: index * 0.05,
                  }}
                >
                  <div className="row">
                    <div className="col-auto">
                      <img
                        className="img-fluid shadow-sm mb-4"
                        src={
                          employee.photo_url
                            ? employee.photo_url
                            : "https://www.tamuk.edu/_images_sitewide/_campus_repository/no-img.jpg"
                        }
                        alt={
                          employee.photo_url
                            ? `${employee.first_name} ${employee.last_name} Headshot`
                            : "default image"
                        }
                      />
                    </div>
                    <div className="col-8">
                      <h2 className="h4">
                        {employee.last_name}
                        {employee.suffix ? ` ${employee.suffix}, ` : ","}{" "}
                        {employee.first_name} {employee.middle_name}
                      </h2>
                      <div className="details ml-md-2">
                        <p>
                          <strong>Phone: </strong>
                          {employee.phone ? (
                            <a
                              href={`tel:${employee.phone}`}
                              aria-label={`Call ${employee.phone}`}
                            >
                              {employee.phone}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </p>
                        <p>
                          <strong>Email: </strong>
                          {employee.email ? (
                            <a
                              href={`mailto:${employee.email}`}
                              aria-label={`Email ${employee.email}`}
                            >
                              {employee.email}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </p>
                        <p>
                          <strong>Title: </strong> {employee?.position || "N/A"}
                        </p>

                        {employee.department ===
                          employee.division_description ? (
                          <p>
                            <strong>Organization: </strong>{" "}
                            {employee.division_description}
                          </p>
                        ) : (
                          <p>
                            <strong>Organization: </strong>{" "}
                            {employee.department} |{" "}
                            {employee.division_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        {/* Pagination Controls */}
        <hr />
        {currentEmployees.length > 0 && (
          <>
            <p className="text-center">Pages</p>
            <div className="pagination">
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`btn btn-sm ${number === currentPage ? "active" : "btn-light"}`}
                  aria-label={`Go to page ${number}`}
                >
                  {number}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
