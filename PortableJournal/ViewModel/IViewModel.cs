using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PortableJournal.ViewModel
{
    // this is almost certainly not the right way to do this :-\
    public interface IViewModel
    {
        string Name { get; }
    }
}
