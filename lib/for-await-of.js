/* eslint-disable no-cond-assign */
module.exports = async function forAwaitOf(fn, iterator) {
  let nextFn;
  let nextItem;
  let done;

  do {
    if (iterator.next && (nextFn = iterator.next())) {
      // eslint-disable-next-line no-await-in-loop
      nextItem = await nextFn;
      done = !nextItem || (nextItem && nextItem.done);
      if (!done) fn(nextItem.value);
    } else {
      done = true;
    }
  } while (!done);
};
