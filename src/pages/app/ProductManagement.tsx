import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Tag,
  Layers,
  Edit,
  AlertCircle,
  CheckCircle,
  FolderPlus,
} from 'lucide-react';
import {
  ActiveSession,
  getProducts,
  getCategories,
  createProduct,
  createCategory,
} from '../../services/shopService';
import { Product, Category } from '../../types/database';

interface ProductManagementProps {
  session: ActiveSession;
  navigate: (route: string) => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({ session, navigate }) => {
  const shop = session.shop;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [baseUnit, setBaseUnit] = useState('Piece'); // Piece, Tin, Bottle, Egg, Bag, Kg
  const [purchaseCost, setPurchaseCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('5');

  // Configurable Selling Units (e.g. Carton of 24 tins)
  const [sellingUnits, setSellingUnits] = useState<
    { unitName: string; conversionToBase: number; sellingPrice: number; isDefault: boolean }[]
  >([]);

  // Temp selling unit input
  const [customUnitName, setCustomUnitName] = useState('');
  const [customUnitConversion, setCustomUnitConversion] = useState('');
  const [customUnitPrice, setCustomUnitPrice] = useState('');

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shop) return;
    loadCatalog();
  }, [shop?.id]);

  const loadCatalog = async () => {
    if (!shop) return;
    setLoading(true);
    const [prods, cats] = await Promise.all([
      getProducts(shop.id),
      getCategories(shop.id),
    ]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  const handleAddCustomUnit = () => {
    if (!customUnitName.trim() || !customUnitConversion || !customUnitPrice) return;
    setSellingUnits([
      ...sellingUnits,
      {
        unitName: customUnitName.trim(),
        conversionToBase: Number(customUnitConversion),
        sellingPrice: Number(customUnitPrice),
        isDefault: false,
      },
    ]);
    setCustomUnitName('');
    setCustomUnitConversion('');
    setCustomUnitPrice('');
  };

  const handleRemoveCustomUnit = (idx: number) => {
    setSellingUnits(sellingUnits.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shop) return;
    if (!name.trim() || !purchaseCost || !sellingPrice || !initialStock) {
      setError('Please fill in required fields (Name, Purchase Cost, Selling Price, Initial Stock).');
      return;
    }

    setSaving(true);

    const result = await createProduct(shop.id, {
      name: name.trim(),
      categoryId: categoryId || null,
      description: description.trim() || undefined,
      barcode: barcode.trim() || undefined,
      baseUnit,
      purchaseCost: Number(purchaseCost),
      sellingPrice: Number(sellingPrice),
      initialStock: Number(initialStock),
      alertThreshold: Number(alertThreshold) || 5,
      sellingUnits,
    });

    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Failed to create product.');
      return;
    }

    // Reset and reload
    setShowAddModal(false);
    setName('');
    setDescription('');
    setBarcode('');
    setPurchaseCost('');
    setSellingPrice('');
    setInitialStock('');
    setSellingUnits([]);
    loadCatalog();
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !newCategoryName.trim()) return;

    setSaving(true);
    await createCategory(shop.id, newCategoryName.trim(), newCategoryDesc.trim());
    setSaving(false);
    setShowCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryDesc('');
    loadCatalog();
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    const matchesCat =
      selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#123B2A]/10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A]">
              Inventory & Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B2A]">
              Product Management
            </h1>
            <p className="text-xs text-[#123B2A]/70 mt-0.5">
              Configure products, categories, purchase costs, and multiple package selling units.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-3.5 py-2 text-xs font-semibold border border-[#123B2A]/20 bg-white rounded-lg hover:bg-[#F7F5EE] flex items-center gap-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Categories ({categories.length})</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 text-xs font-bold bg-[#123B2A] text-white rounded-lg hover:bg-[#1b523b] flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Product</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#123B2A]/10 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#123B2A]/40 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter products by name or barcode..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[#123B2A]/70 whitespace-nowrap">Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs bg-white text-[#123B2A]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table or Zero-Data Empty State */}
        <div className="bg-white rounded-xl border border-[#123B2A]/10 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#123B2A]/60">Loading catalog...</div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F7F5EE] text-[#123B2A]/40 flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#123B2A]">No products yet</h3>
              <p className="text-xs text-[#123B2A]/70 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
                Your shop catalog is currently empty. Register your first provision item (such as milk, rice, eggs, or sugar) to start tracking inventory and processing sales.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-[#123B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1b523b] shadow-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Product</span>
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#123B2A]/70">
              No products found matching the current search query or category filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F5EE] text-[#123B2A]/70 border-b border-[#123B2A]/10 font-semibold">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Base Unit</th>
                    <th className="p-3 text-right">Purchase Cost</th>
                    <th className="p-3 text-right">Retail Price</th>
                    <th className="p-3 text-right">Current Stock</th>
                    <th className="p-3">Selling Formats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#123B2A]/5 font-mono">
                  {filteredProducts.map((p) => {
                    const isLowStock = p.current_stock <= p.alert_threshold;
                    return (
                      <tr key={p.id} className="hover:bg-[#F7F5EE]/40">
                        <td className="p-3 font-sans font-semibold text-[#123B2A]">
                          <div>{p.name}</div>
                          {p.barcode && (
                            <div className="text-[10px] text-[#123B2A]/50 font-mono">
                              Barcode: {p.barcode}
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-sans text-[#123B2A]/70">
                          {p.category?.name || 'Uncategorized'}
                        </td>
                        <td className="p-3 font-sans">{p.base_unit}</td>
                        <td className="p-3 text-right text-[#123B2A]/70">
                          GH₵ {Number(p.purchase_cost).toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-bold text-[#123B2A]">
                          GH₵ {Number(p.selling_price).toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`font-bold ${
                              isLowStock ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded' : ''
                            }`}
                          >
                            {p.current_stock}
                          </span>
                        </td>
                        <td className="p-3 font-sans text-[11px] text-[#123B2A]/75">
                          {p.selling_units && p.selling_units.length > 0 ? (
                            p.selling_units.map((u) => (
                              <span
                                key={u.id}
                                className="inline-block mr-2 text-[10px] bg-[#123B2A]/5 px-1.5 py-0.5 rounded"
                              >
                                {u.unit_name} ({u.conversion_to_base})
                              </span>
                            ))
                          ) : (
                            <span className="text-[#123B2A]/50">Single only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Register Product */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-[#123B2A]/20 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-3 border-b border-[#123B2A]/10">
                <div>
                  <h3 className="text-base font-bold text-[#123B2A]">Register New Product</h3>
                  <p className="text-xs text-[#123B2A]/70">
                    Add product information, base stock, and packaging selling units.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-xs text-[#123B2A]/60 hover:text-[#123B2A]"
                >
                  ✕ Close
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ideal Evaporated Milk (160g)"
                      className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs bg-[#F7F5EE]/40 text-[#123B2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs bg-white text-[#123B2A]"
                    >
                      <option value="">Unassigned</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Base Stock Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={baseUnit}
                      onChange={(e) => setBaseUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs bg-white text-[#123B2A]"
                    >
                      <option value="Piece">Piece / Single</option>
                      <option value="Tin">Tin (e.g. Milk, Tomato Paste)</option>
                      <option value="Bottle">Bottle (e.g. Oil, Water)</option>
                      <option value="Egg">Egg</option>
                      <option value="Bag">Bag (e.g. Rice, Sugar)</option>
                      <option value="Kg">Kilogram (Kg)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Purchase Cost (GH₵ / Base Unit) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={purchaseCost}
                      onChange={(e) => setPurchaseCost(e.target.value)}
                      placeholder="e.g. 6.50"
                      className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs font-mono text-[#123B2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Retail Selling Price (GH₵ / Base Unit) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="e.g. 8.50"
                      className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs font-mono font-bold text-[#123B2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Opening Stock Quantity ({baseUnit}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={initialStock}
                      onChange={(e) => setInitialStock(e.target.value)}
                      placeholder="e.g. 48"
                      className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs font-mono text-[#123B2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Low Stock Alert Threshold
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(e.target.value)}
                      placeholder="5"
                      className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs font-mono text-[#123B2A]"
                    />
                  </div>
                </div>

                {/* Optional Custom Packaging Selling Units */}
                <div className="pt-3 border-t border-[#123B2A]/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#123B2A]">
                      Configurable Packaging Selling Units (Optional)
                    </span>
                    <span className="text-[11px] text-[#123B2A]/60">
                      e.g. Carton of 24 Tins, Crate of 30 Eggs
                    </span>
                  </div>

                  {sellingUnits.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {sellingUnits.map((u, i) => (
                        <div
                          key={i}
                          className="p-2 bg-[#F7F5EE] rounded flex items-center justify-between text-xs font-mono"
                        >
                          <div>
                            <span className="font-semibold text-[#123B2A]">{u.unitName}</span>
                            <span className="text-[#123B2A]/70">
                              {' '}
                              = {u.conversionToBase} {baseUnit}s @ GH₵ {u.sellingPrice.toFixed(2)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomUnit(i)}
                            className="text-red-500 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 bg-[#F7F5EE]/50 p-2.5 rounded-lg border border-[#123B2A]/10">
                    <input
                      type="text"
                      value={customUnitName}
                      onChange={(e) => setCustomUnitName(e.target.value)}
                      placeholder="Format (e.g. Carton)"
                      className="px-2.5 py-1.5 rounded border border-[#123B2A]/20 text-xs bg-white"
                    />
                    <input
                      type="number"
                      value={customUnitConversion}
                      onChange={(e) => setCustomUnitConversion(e.target.value)}
                      placeholder={`Qty in ${baseUnit}`}
                      className="px-2.5 py-1.5 rounded border border-[#123B2A]/20 text-xs font-mono bg-white"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        step="0.01"
                        value={customUnitPrice}
                        onChange={(e) => setCustomUnitPrice(e.target.value)}
                        placeholder="GH₵ Price"
                        className="w-full px-2.5 py-1.5 rounded border border-[#123B2A]/20 text-xs font-mono bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomUnit}
                        className="px-3 bg-[#123B2A] text-white rounded text-xs shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#123B2A]/10">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-[#123B2A]/20 text-xs font-semibold rounded-lg hover:bg-[#F7F5EE]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#123B2A] text-white text-xs font-bold rounded-lg hover:bg-[#1b523b]"
                  >
                    {saving ? 'Saving...' : 'Register Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Category Management */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#123B2A]/20 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#123B2A]/10">
                <h3 className="text-base font-bold text-[#123B2A]">Product Categories</h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-xs text-[#123B2A]/60 hover:text-[#123B2A]"
                >
                  ✕ Close
                </button>
              </div>

              {/* Existing categories */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {categories.length === 0 ? (
                  <div className="text-xs text-[#123B2A]/60 py-2">
                    No custom categories created yet.
                  </div>
                ) : (
                  categories.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 bg-[#F7F5EE] rounded flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-[#123B2A]">{c.name}</span>
                      <span className="text-[11px] text-[#123B2A]/60">Active</span>
                    </div>
                  ))
                )}
              </div>

              {/* Add category form */}
              <form onSubmit={handleCreateCategory} className="space-y-3 pt-3 border-t border-[#123B2A]/10">
                <div>
                  <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                    New Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Dairy & Milk, Beverages, Grains, Soap & Detergents"
                    className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs bg-[#F7F5EE]/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2 bg-[#123B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1b523b]"
                >
                  {saving ? 'Adding...' : 'Create Category'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
