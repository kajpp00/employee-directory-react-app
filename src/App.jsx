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
  const [departmentInitialized, setDepartmentInitialized] = useState(false);
  const [facultyFilter, setFacultyFilter] = useState(true);
  const [staffFilter, setStaffFilter] = useState(true);
  const [showImages, setShowImages] = useState(true);
  const [noImageFilter, setNoImageFilter] = useState(false);
  const [employeesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedLastNameQuery, setDebouncedLastNameQuery] = useState(lastNameQuery);
  const [debouncedFirstNameQuery, setDebouncedFirstNameQuery] = useState(firstNameQuery);


  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    Papa.parse(employeeCSV, {
      download: true,
      header: true,
      complete: function (results) {
        const employeeData = results.data;

        setEmployees(employeeData);

        const params = new URLSearchParams(window.location.search);

        const departmentParam = params.get("department");
        const noImageParam = params.get("noimage");

        if (departmentParam) {
          const matchingDepartment = [
            ...new Set(
              employeeData
                .map((employee) => employee.department)
                .filter(Boolean)
            ),
          ].find(
            (department) =>
              department.toLowerCase() ===
              departmentParam.toLowerCase()
          );

          if (matchingDepartment) {
            setDepartmentFilter(matchingDepartment);
          }
        }

        if (noImageParam?.toLowerCase() === "true") {
          setNoImageFilter(true)
        }

        setDepartmentInitialized(true);
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

    const matchesDepartment = departmentFilter
      ? employee.department
        ?.toLowerCase()
        .includes(departmentFilter.toLowerCase())
      : true;

    const employeeType = employee.employee_type?.toLowerCase();

    const matchesEmployeeType =
      (facultyFilter && employeeType === "faculty") ||
      (staffFilter && employeeType === "staff");

    const matchesNoImage = noImageFilter
      ? !employee.photo_url
      : true;

    return (
      matchesLastName &&
      matchesFirstName &&
      matchesDepartment &&
      matchesEmployeeType &&
      matchesNoImage
    )

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



  // Handle debouncing of the search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLastNameQuery(lastNameQuery);
      setDebouncedFirstNameQuery(firstNameQuery);
    }, 500); // Debounce delay (500ms)

    return () => clearTimeout(timer); // Cleanup timer on change
  }, [lastNameQuery, firstNameQuery]);

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
    setFacultyFilter(true);
    setStaffFilter(true);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <>
      <div className="App container py-5">
        <h1 className="my-4">Campus Directory</h1>
        <p>Search faculty and staff across Texas A&M University-Kingsville</p>
        {/* <p>
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
        </p> */}
        {/* Directory Filters */}
        <div className="directory-filters mb-3">

          {/* Search */}
          <div className="filter-section">
            <h2 className="h5 mb-3">Search</h2>

            <div className="row mb-3">
              <div className="col-md-4 mb-3 mb-md-0">
                <label htmlFor="firstNameSearch">
                  First Name
                </label>

                <input
                  id="firstNameSearch"
                  type="text"
                  className="form-control"
                  placeholder="Enter first name"
                  value={firstNameQuery}
                  onChange={(e) => {
                    setFirstNameQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="col-md-4 mb-3 mb-md-0">
                <label htmlFor="lastNameSearch">
                  Last Name
                </label>

                <input
                  id="lastNameSearch"
                  type="text"
                  className="form-control"
                  placeholder="Enter last name"
                  value={lastNameQuery}
                  onChange={(e) => {
                    setLastNameQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="col-md-4">

                <label htmlFor="departmentSelect">
                  Department
                </label>

                <select
                  id="departmentSelect"
                  className="form-control"
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Departments</option>

                  {departments.map((department, index) => (
                    <option key={index} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col-auto mb-3 mr-4">
                <fieldset>
                  <legend>Employee Type</legend>
                  <div className="d-flex flex-wrap">

                    <div className="custom-control custom-checkbox mr-4">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="facultyFilter"
                        checked={facultyFilter}
                        onChange={(e) => {
                          setFacultyFilter(e.target.checked);
                          setCurrentPage(1);
                        }}
                      />

                      <label
                        className="custom-control-label"
                        htmlFor="facultyFilter"
                      >
                        Faculty
                      </label>
                    </div>

                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="staffFilter"
                        checked={staffFilter}
                        onChange={(e) => {
                          setStaffFilter(e.target.checked);
                          setCurrentPage(1);
                        }}
                      />

                      <label
                        className="custom-control-label"
                        htmlFor="staffFilter"
                      >
                        Staff
                      </label>
                    </div>

                  </div>
                </fieldset>
              </div>

              <div className="col-auto">
                <fieldset>
                  <legend>Display Options</legend>
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="showImages"
                      checked={showImages}
                      onChange={(e) => setShowImages(e.target.checked)}
                    />

                    <label
                      className="custom-control-label"
                      htmlFor="showImages"
                    >
                      Show profile images
                    </label>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

        </div>
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4">

          <p className="mb-2 mb-sm-0">
            <strong>
              Showing {filteredEmployees.length} results
            </strong>
          </p>

          <button
            className="btn btn-sm btn-outline-dark"
            onClick={resetFilters}
            aria-label="Reset filters"
          >
            Reset Filters
          </button>

        </div>
        <div className="row employee-wrapper">
          <AnimatePresence mode="wait">

            {!departmentInitialized ? (
              <div className="col-12 text-center py-4">
                <p>Loading directory...</p>
              </div>
            ) : currentEmployees.length === 0 ? (
              <div className="col-12 my-2 p-3 rounded">
                <h2 role="alert">
                  No results found! Try adjusting your search criteria.
                </h2>
              </div>
            ) : (
              currentEmployees.map((employee) => (
                <motion.div
                  key={employee._id}
                  className="col-12 mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="employee-card p-3">

                    <div className="row">

                      {showImages && (
                        <div className="col-auto">
                          <img
                            className="employee-photo img-fluid shadow-sm"
                            src={
                              employee.photo_url
                                ? employee.photo_url
                                : "https://www.tamuk.edu/_images_sitewide/_campus_repository/no-img.jpg"
                            }
                            alt=""
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      <div className={showImages ? "col-md-8" : "col-12"}>

                        <div className="row">
                          <div className="col-12">

                            <h2 className="h3 font-weight-bold">
                              {employee.last_name}
                              {employee.suffix
                                ? ` ${employee.suffix}, `
                                : ","}{" "}
                              {employee.first_name} {employee.middle_name}
                            </h2>
                          </div>

                          <div className="col-12">
                            <p className="font-weight-bold mb-2">
                              {employee.position || "N/A"}
                            </p>
                          </div>

                          <div className="col-12">
                            {employee.department === employee.division_description ? (
                              <><p>{employee.division_description}</p></>
                            ) : (
                              <>
                                <p>{employee.department} / {employee.division_description}</p>
                              </>
                            )}
                          </div>

                        </div>
                        <div className="row contact">

                          {employee.phone && (
                            <div className="col-md-auto col-12 mb-1">
                              <dl className="mb-0">
                                <dt className="sr-only">Phone</dt>
                                <dd className="mb-0">
                                  <a
                                    href={`tel:${employee.phone}`}
                                    aria-label={`Call ${employee.phone}`}
                                  >
                                    {employee.phone}
                                  </a>
                                </dd>
                              </dl>
                            </div>
                          )}

                          {employee.email && (
                            <div className="col-md-auto col-12 mb-1">
                              <dl className="mb-0">
                                <dt className="sr-only">Email</dt>
                                <dd className="mb-0">
                                  <a
                                    href={`mailto:${employee.email}`}
                                    aria-label={`Email ${employee.email}`}
                                  >
                                    {employee.email}
                                  </a>
                                </dd>
                              </dl>
                            </div>
                          )}

                          {employee.cv && (
                            <div className="col-md-auto col-12 mb-1">
                              <a
                                href={employee.cv}
                                aria-label={`${employee.first_name} ${employee.last_name} curriculum vitae`}
                              >
                                Curriculum Vitae
                              </a>
                            </div>
                          )}

                        </div>
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
