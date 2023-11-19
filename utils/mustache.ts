import Mustache from 'mustache';

function extractVariables(template: string): string[] {
  const variables = Mustache.parse(template)
    .filter(function (v) {
      return v[0] === 'name' || v[0] === '#' || v[0] === '&';
    })
    .map(function (v) {
      return v[1];
    });
  return [...new Set(variables)];
}

export default extractVariables;
