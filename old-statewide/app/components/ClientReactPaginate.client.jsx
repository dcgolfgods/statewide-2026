import PaginateModule from 'react-paginate';

const ReactPaginate =
  (typeof PaginateModule?.default?.default === 'function' &&
    PaginateModule.default.default) ||
  (typeof PaginateModule?.default === 'function' && PaginateModule.default) ||
  (typeof PaginateModule === 'function' && PaginateModule) ||
  null;

const ClientReactPaginate = (props) => {
  if (!ReactPaginate) {
    return null;
  }

  return <ReactPaginate {...props} />;
};

export {ClientReactPaginate};
