# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



jnjk
const [apiInvoices, setApiInvoices] = useState([]);
 const [searchItem, setSearchItem] = useState("");
const [filteredInoices, setFilteredInvoices] = useState([]);


const handleInputChange = (e) => {
    const searchTerm = e.target.value;
    setSearchItem(searchTerm);

    const filteredItems = invoices.filter((invoice) =>
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase())
     
    );


    setFilteredInvoices(filteredItems);
  };
  
  useEffect(() => {
      fetch("api/Invoices/")
      .then(response => response.json())
      .then(data => setApiInvoices(data.invoices))
      .catch(err => console.log(err))
  }, [])



            <input
              type="text"
              placeholder="Search clients"
              value={searchItem}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <ul>
              {filteredInvoices.map((invoices) => (
                <li key={invoices.id} className="py-2 border-b border-gray-200">
                  {clients.name}
                </li>
              ))}
            </ul>
