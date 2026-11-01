import {Form, useNavigate} from '@remix-run/react';
import {useEffect, useState} from 'react';

import {Input, IconSearch} from '~/components';

export function AnnouncementSearchBar({defaultValue = '', month = ''}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState(defaultValue);
  const [firstChangeDone, setFirstChangeDone] = useState(false);

  useEffect(() => {
    setSearch(defaultValue || '');
  }, [defaultValue]);

  useEffect(() => {
    if (!firstChangeDone) return;
    if (search.length !== 0) return;

    const params = new URLSearchParams();
    if (month) params.set('month', month);
    const query = params.toString();
    navigate(query ? `/announcement?${query}` : '/announcement');
  }, [search, firstChangeDone, month, navigate]);

  return (
    <div className="mb-3">
      <Form
        action="/announcement"
        className="relative flex items-center w-full"
      >
        {month ? <input type="hidden" name="month" value={month} /> : null}
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setFirstChangeDone(true);
          }}
          className="text-[.9em] w-full rounded-[7px] border-2 border-[#00aeef] placeholder:text-[#1e5099] text-[#1e5099] h-[40px]"
          type="search"
          autoComplete="off"
          variant="minisearch"
          placeholder="Search announcements"
          name="s"
        />
        <button
          type="submit"
          className="absolute top-1/2 transform right-4 -translate-y-1/2  flex items-center justify-center w-8 h-8"
        >
          <IconSearch />
        </button>
      </Form>
    </div>
  );
}